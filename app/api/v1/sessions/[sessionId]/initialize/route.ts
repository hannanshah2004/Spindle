import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/app/lib/user';
import { initializeStagehand, removeStagehand } from '@/app/lib/stagehandManager';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  let stagehandInitialized = false;
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
      return NextResponse.json({ error: `Session already initialized with status: ${session.status}` }, { status: 409 }); 
    }
    
    const startUrl = session.startUrl || 'https://example.com'; // Get startUrl from session

    // 4. Initialize Stagehand (launches browser, sets status to 'running' or 'failed')
    const stagehand = await initializeStagehand(sessionId); 
    stagehandInitialized = true; 

    // 5. Perform Initial Navigation using direct goto
    console.log(`[Initialize] Navigating session ${sessionId} directly to ${startUrl}`);
    try {
      await stagehand.page.goto(startUrl, { waitUntil: 'domcontentloaded' }); 
      console.log(`[Initialize] Direct navigation complete for session ${sessionId}`);
    } catch(navError) {
        console.error(`[Initialize] Initial navigation failed for session ${sessionId}:`, navError);
        // If navigation fails, we should probably mark the session as failed and cleanup
        await prisma.session.update({ where: { id: sessionId }, data: { status: 'failed' }});
        // Call removeStagehand for cleanup
        await removeStagehand(sessionId);
        throw new Error(`Initial navigation to ${startUrl} failed.`); // Rethrow to be caught by main handler
    }

    // Update last used time
    await prisma.session.update({
        where: { id: sessionId },
        data: { lastUsedAt: new Date() },
      });

    // 6. Return Success (only indicates initialization + navigation started)
    console.log(`[Initialize] Session ${sessionId} initialized and navigated successfully.`);
    return NextResponse.json({ success: true, message: 'Session initialized and navigated.' });

  } catch (error) {
    console.error(`[Initialize] Caught error during session ${sessionId || 'unknown'} initialization/navigation:`, error);
    // Update status to 'failed' if initialization started but something went wrong
    if (sessionId && stagehandInitialized) {
        console.log(`[Initialize] Attempting to mark session ${sessionId} as failed due to error.`);
        try {
          await prisma.session.update({ where: { id: sessionId }, data: { status: 'failed' }});
          console.log(`[Initialize] Session ${sessionId} marked as failed.`);
          // Also attempt cleanup if error happened after initialization but NOT during navigation (already handled)
          if (!(error instanceof Error && error.message.includes('Initial navigation'))) {
             await removeStagehand(sessionId);
          }
        } catch (dbError) {
          console.error(`[Initialize] Failed to update session status/cleanup for ${sessionId} after error:`, dbError);
        }
        // Note: Stagehand instance cleanup might happen here or be handled by a separate process
    }
    
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Session initialization or navigation failed', details: message }, { status: 500 });
  }
} 