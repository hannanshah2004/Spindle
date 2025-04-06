// Remove the Edge Runtime setting
// export const runtime = 'edge';

import { NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server'; // Remove this
import { PrismaClient } from '@prisma/client';
// Switch to the new stagehandManager
// import { removeSession } from '../sessionStore';
import { removeStagehand } from '@/app/lib/stagehandManager';
import { getOrCreateUser } from '@/app/lib/user'; // Import our utility

const prisma = new PrismaClient();

interface Params {
  sessionId: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    // Get user from our database
    const user = await getOrCreateUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Await params before destructuring
    const resolvedParams = await params;
    const { sessionId } = resolvedParams;

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
    console.error(`Error fetching session ${params.sessionId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  // Note: This is now more like an "Update Status to Completed/Terminated" endpoint
  let sessionId: string | null = null;
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const resolvedParams = await params;
    sessionId = resolvedParams.sessionId; // Assign sessionId here
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 1. Fetch Session from DB (Needed for ownership check and getting current status)
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      // Select necessary fields, including status
      select: { id: true, status: true, project: { select: { userId: true } } }, 
    });

    if (!session) {
      // Try cleanup even if DB record missing
      try { await removeStagehand(sessionId); } catch { /* ignore */ }
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Verify Ownership 
    if (session.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Clean up Stagehand instance (Close browser)
    try {
      console.log(`[DELETE /sessions] Removing Stagehand instance for ${sessionId}`);
      await removeStagehand(sessionId);
      console.log(`[DELETE /sessions] Stagehand instance for ${sessionId} removed.`);
    } catch (cleanupError) {
      console.error(`Error cleaning up Stagehand instance for session ${sessionId}:`, cleanupError);
      // Don't fail the operation, but log it. The session might be marked completed anyway.
    }

    // 4. Update Session Status in DB to 'completed'
    console.log(`[DELETE /sessions] Updating session ${sessionId} status to completed.`);
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
         status: 'completed', 
         lastUsedAt: new Date(), // Update timestamp
         // Optionally set completedAt here if you add that field
      },
      // Include actions in the response so frontend updates correctly
      include: { actions: { orderBy: { createdAt: 'asc' } } } 
    });
    console.log(`[DELETE /sessions] Session ${sessionId} status updated.`);

    // 5. Return Success with updated session data
    return NextResponse.json(updatedSession, { status: 200 }); 

  } catch (error) {
    console.error(`Error during session termination (update status) for ${sessionId || 'unknown'}:`, error);
    // If error happened, the session status might not be updated
    return NextResponse.json({ error: 'Internal Server Error during termination' }, { status: 500 });
  }
} 