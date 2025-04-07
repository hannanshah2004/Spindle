import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/app/lib/user';

const prisma = new PrismaClient();

// Get the Stagehand service URL from environment variables
const STAGEHAND_SERVICE_URL = process.env.STAGEHAND_SERVICE_URL;

if (!STAGEHAND_SERVICE_URL) {
  console.warn("STAGEHAND_SERVICE_URL environment variable is not set. Session initialization will fail.");
  // Depending on deployment strategy, you might want to throw an error here during build/startup
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
    // URL is /api/v1/sessions/[sessionId]/initialize, so sessionId is the second to last segment
    sessionId = segments[segments.length - 2];
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 3. Fetch Session to get startUrl and verify ownership/status
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { project: { select: { userId: true } } },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (session.status !== 'created') {
      return NextResponse.json({ error: `Session already initialized or in invalid state: ${session.status}` }, { status: 409 });
    }
    
    const startUrl = session.startUrl || 'https://example.com'; // Get startUrl from session

    if (!STAGEHAND_SERVICE_URL) {
      return NextResponse.json({ error: 'Stagehand service is not configured on the server.' }, { status: 503 }); // 503 Service Unavailable
    }

    const stagehandInitializeUrl = `${STAGEHAND_SERVICE_URL}/sessions/${sessionId}/initialize`;
    console.log(`[API Route] Calling Stagehand service to initialize: ${stagehandInitializeUrl}`);

    // 4. Call the external Stagehand service to initialize and navigate
    const response = await fetch(stagehandInitializeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary auth headers for the stagehand service if needed
        // 'Authorization': `Bearer ${process.env.STAGEHAND_API_KEY}` 
      },
      body: JSON.stringify({ startUrl: startUrl }),
    });

    // 5. Check the response from Stagehand service
    if (!response.ok) {
      let errorDetails = 'Failed to initialize session in Stagehand service.';
      try {
        const errorBody = await response.json();
        errorDetails = errorBody.details || errorBody.error || errorDetails;
        console.error(`[API Route] Stagehand service failed for ${sessionId}: Status ${response.status}, Body:`, errorBody);
      } catch (e) {
        console.error(`[API Route] Stagehand service failed for ${sessionId} with status ${response.status} and non-JSON response. Parse error:`, e);
      }
      // Mark the session as failed in our DB if Stagehand couldn't initialize
      await prisma.session.update({
        where: { id: sessionId },
        data: { status: 'failed' },
      });
      // Return the status code received from Stagehand if possible, otherwise 500/503
      const clientStatusCode = response.status >= 500 ? 503 : response.status; // Avoid leaking 500s directly?
      return NextResponse.json({ error: 'Stagehand service failed to initialize session', details: errorDetails }, { status: clientStatusCode });
    }

    // 6. Stagehand service succeeded - update our DB status to 'running'
    console.log(`[API Route] Stagehand service successful for ${sessionId}. Updating status to running.`);
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'running',
        lastUsedAt: new Date(),
      },
    });

    // 7. Return success to the client
    return NextResponse.json({ success: true, message: 'Session initialized and running.' });

  } catch (error) {
    // Catch errors from DB lookups, user auth, or unexpected issues
    console.error(`[API Route] Unexpected error during initialize flow for session ${sessionId || 'unknown'}:`, error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        
    return NextResponse.json({ error: 'Internal Server Error during initialization flow', details: message }, { status: 500 });
  }
} 