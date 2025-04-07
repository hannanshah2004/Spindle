import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/app/lib/user'; // Import our utility

const prisma = new PrismaClient();

// Get the Stagehand service URL from environment variables
const STAGEHAND_SERVICE_URL = process.env.STAGEHAND_SERVICE_URL;

if (!STAGEHAND_SERVICE_URL) {
  console.warn("STAGEHAND_SERVICE_URL environment variable is not set. Session termination might not clean up browser instances.");
}

// export async function GET(request: Request, context: { params: Params }) {
export async function GET(request: NextRequest) {
  try {
    // Get user from our database
    const user = await getOrCreateUser();
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // const { sessionId } = await context.params;
    const segments = request.nextUrl.pathname.split('/');
    const sessionId = segments[segments.length - 1];

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 1. Fetch Session from DB, including related actions
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { 
        project: { select: { userId: true } }, // Still need project for ownership check
        actions: { // Include the actions
            orderBy: { createdAt: 'asc' } // Order them chronologically
        } 
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Verify Ownership against our database user
    if (session.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Return Session Details (excluding project info, but including actions)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { project, ...sessionDetails } = session; 
    return NextResponse.json(sessionDetails); // sessionDetails now includes the 'actions' array

  } catch (error) {
    // console.error(`Error fetching session ${context.params?.sessionId || 'unknown'}:`, error);
    console.error(`Error fetching session by ID:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// export async function DELETE(request: Request, context: { params: Params }) {
export async function DELETE(request: NextRequest) {
  let sessionId: string | null = null;
  try {
    // 1. Authenticate User (No change)
    const user = await getOrCreateUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate Params (No change)
    const segments = request.nextUrl.pathname.split('/');
    sessionId = segments[segments.length - 1];
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 3. Fetch Session for ownership check (No change, but maybe only need project.userId)
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { status: true, project: { select: { userId: true } } }, 
    });

    // If session doesn't exist in DB, still try to call Stagehand cleanup just in case
    if (!session) {
      console.warn(`[API Route DELETE] Session ${sessionId} not found in DB, attempting Stagehand cleanup anyway.`);
      await callStagehandDelete(sessionId); // Fire-and-forget cleanup attempt
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 4. Verify Ownership (No change)
    if (session.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 5. Call the external Stagehand service to terminate the browser instance
    // We do this *before* updating our DB state
    // We'll proceed even if Stagehand cleanup fails, just log the error
    await callStagehandDelete(sessionId);

    // 6. Update Session Status in DB to 'completed' (Main goal)
    console.log(`[API Route DELETE] Updating session ${sessionId} status to completed.`);
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        lastUsedAt: new Date(),
      },
      // Include actions if needed by frontend, otherwise remove for efficiency
      include: { actions: { orderBy: { createdAt: 'asc' } } } 
    });
    console.log(`[API Route DELETE] Session ${sessionId} status updated.`);

    // 7. Return Success with updated session data
    return NextResponse.json(updatedSession, { status: 200 });

  } catch (error) {
    // Catch errors from DB, user auth, etc.
    console.error(`[API Route DELETE] Error during session termination flow for ${sessionId || 'unknown'}:`, error);
    return NextResponse.json({ error: 'Internal Server Error during termination' }, { status: 500 });
  }
}

/**
 * Helper function to call the Stagehand service DELETE endpoint.
 * Logs errors but does not throw, allowing DB update to proceed.
 */
async function callStagehandDelete(sessionId: string): Promise<void> {
  if (!STAGEHAND_SERVICE_URL) {
    console.error(`[API Route DELETE] Cannot call Stagehand service for session ${sessionId}: URL not configured.`);
    return; // Cannot proceed
  }

  const stagehandDeleteUrl = `${STAGEHAND_SERVICE_URL}/sessions/${sessionId}`;
  console.log(`[API Route DELETE] Calling Stagehand service to terminate: ${stagehandDeleteUrl}`);

  try {
    const response = await fetch(stagehandDeleteUrl, {
      method: 'DELETE',
      headers: {
        // Add auth headers if needed
      },
    });

    if (!response.ok) {
      // Log Stagehand termination failure
      try {
        const errorBody = await response.json();
        console.error(`[API Route DELETE] Stagehand service termination failed for ${sessionId}: Status ${response.status}, Body:`, errorBody);
      } catch (e) {
        console.error(`[API Route DELETE] Stagehand service termination failed for ${sessionId} with status ${response.status} and non-JSON response. Parse error:`, e);
      }
    } else {
      console.log(`[API Route DELETE] Stagehand service successfully terminated session ${sessionId}.`);
    }
  } catch (fetchError) {
    // Log network errors calling Stagehand
    console.error(`[API Route DELETE] Network error calling Stagehand service for session ${sessionId}:`, fetchError);
  }
} 