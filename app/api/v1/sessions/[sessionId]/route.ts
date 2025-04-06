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

    // 1. Fetch Session from DB
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { project: { select: { userId: true } } },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Verify Ownership against our database user
    if (session.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Return Session Details (excluding project info)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { project, ...sessionDetails } = session;
    return NextResponse.json(sessionDetails);

  } catch (error) {
    console.error(`Error fetching session ${params.sessionId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
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

    // 1. Fetch Session from DB (Needed to verify ownership)
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, project: { select: { userId: true } } },
    });

    if (!session) {
      // Still try to clean up potential Stagehand instance even if no DB record exists
      try {
        await removeStagehand(sessionId);
      } catch (cleanupError) {
        // Just log, don't fail the request
        console.error(`Failed to clean up Stagehand instance for session ${sessionId}:`, cleanupError);
      }
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Verify Ownership against our database user
    if (session.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Clean up Stagehand instance if it exists
    try {
      await removeStagehand(sessionId);
    } catch (cleanupError) {
      // Just log, don't fail the delete operation
      console.error(`Error cleaning up Stagehand instance for session ${sessionId}:`, cleanupError);
    }

    // 4. Delete Session from DB
    await prisma.session.delete({
      where: { id: sessionId },
    });

    // 5. Return Success
    return new NextResponse(null, { status: 204 }); // No content on successful delete

  } catch (error) {
    console.error(`Error deleting session ${params?.sessionId || 'unknown'}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 