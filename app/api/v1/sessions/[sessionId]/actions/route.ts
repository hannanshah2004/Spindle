import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Removed SessionAction import
import { getOrCreateUser } from '@/app/lib/user';
import { z } from 'zod';

const prisma = new PrismaClient();

// Get the Stagehand service URL from environment variables
const STAGEHAND_SERVICE_URL = process.env.STAGEHAND_SERVICE_URL;

if (!STAGEHAND_SERVICE_URL) {
  console.warn("STAGEHAND_SERVICE_URL environment variable is not set. Session actions will fail.");
}

// Validate the action request body
const actionSchema = z.object({
  action: z.string().min(1, "Action instruction is required")
});

// Define the expected response structure from the Stagehand service action endpoint
// This should match the ActResult type from @browserbasehq/stagehand
interface StagehandActionResult {
  success: boolean;
  message: string;
  // Include other fields from ActResult if you need them
  screenshotUrl?: string | null; 
  html?: string | null;
  [key: string]: unknown; // Allow other properties
}

export async function POST(request: NextRequest) {
  let sessionId: string | null = null;

  try {
    // 1. Authenticate User
    const user = await getOrCreateUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate Params
    const segments = request.nextUrl.pathname.split('/');
    // URL is /api/v1/sessions/[sessionId]/actions, so sessionId is the second to last segment
    sessionId = segments[segments.length - 2];
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 3. Validate request body
    let requestData;
    try {
      const body = await request.json();
      requestData = actionSchema.parse(body);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: error instanceof z.ZodError ? error.format() : String(error) 
      }, { status: 400 });
    }

    // 4. Verify Session Exists, Belongs to User, and is Running
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { status: true, project: { select: { userId: true } } }, // Select only needed fields
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (session.status !== 'running') {
      return NextResponse.json({ error: `Session is not running (status: ${session.status}). Cannot perform actions.` }, { status: 409 }); 
    }

    // --- Start Refactor ---
    if (!STAGEHAND_SERVICE_URL) {
      return NextResponse.json({ error: 'Stagehand service is not configured on the server.' }, { status: 503 });
    }
    
    const stagehandActionUrl = `${STAGEHAND_SERVICE_URL}/sessions/${sessionId}/actions`;
    console.log(`[API Route] Calling Stagehand service for action: ${stagehandActionUrl}`);

    // 5. Call the external Stagehand service to perform the action
    const response = await fetch(stagehandActionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
        },
        body: JSON.stringify({ action: requestData.action }), // Send the action instruction
      });

    let actionResult: StagehandActionResult;
    let stagehandCallSucceeded = false;

    // Try to parse the result from Stagehand, even if response.ok is false (might contain error details)
    try {
      actionResult = await response.json();
      stagehandCallSucceeded = response.ok; // Use response.ok to determine actual HTTP success
    } catch (e) {
        // Handle cases where Stagehand service returns non-JSON or network error occurs
        console.error(`[API Route] Failed to parse response or call Stagehand service for session ${sessionId}. Status: ${response?.status}. Error:`, e);
        // Record a generic failure action in the DB
        await recordActionInDb(sessionId, requestData.action, false, 'Failed to communicate with or parse response from Stagehand service');
        return NextResponse.json({ success: false, error: 'Failed to communicate with Stagehand service', details: e instanceof Error ? e.message : String(e) }, { status: 503 });
    }

    // 6. Record the Action in the Database (using the result from Stagehand)
    await recordActionInDb(sessionId, requestData.action, actionResult.success, actionResult.message);

    // 7. Return the Result from Stagehand service to the client
    // Use the status code from the Stagehand response if it wasn't ok, otherwise 200
    const clientStatusCode = stagehandCallSucceeded ? 200 : (response.status || 500);
    return NextResponse.json(actionResult, { status: clientStatusCode }); 
    // --- End Refactor ---

  } catch (error) {
    // Catch errors from validation, DB checks, etc. (pre-Stagehand call)
    console.error(`[API Route] Unexpected error during action flow for session ${sessionId || 'unknown'}:`, error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Internal Server Error during action flow', details: message }, { status: 500 });
  }
}

/**
 * Helper function to record the action in the database.
 */
async function recordActionInDb(
    sessionId: string, 
    actionDetail: string, 
    success: boolean, 
    message: string
): Promise<void> {
    try {
        await prisma.sessionAction.create({
          data: {
            sessionId: sessionId,
            actionType: 'nlp', // Keep as nlp for now
            details: actionDetail,
            status: success ? 'success' : 'failed',
            message: message,
            // Optionally store more data from stagehandResult if your schema supports it
            // resultData: stagehandResult ? JSON.stringify(stagehandResult) : null 
          },
        });
        // Update session's lastUsedAt timestamp regardless of action success/failure
        await prisma.session.update({ where: { id: sessionId }, data: { lastUsedAt: new Date() } });
      } catch (dbError) {
        console.error(`[API Route Action] Failed to record action or update timestamp for session ${sessionId}:`, dbError);
        // Log the error, but don't fail the main request because of logging issues
      }
} 