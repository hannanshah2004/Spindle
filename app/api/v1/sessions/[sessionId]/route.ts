import { NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server'; // Remove this
import { PrismaClient } from '@prisma/client';
import { removeSession } from '../sessionStore';
import { getOrCreateUser } from '@/app/lib/user'; // Import our utility

const prisma = new PrismaClient();

interface Params {
  sessionId: string;
}

export async function GET({ params }: { params: Params }) {
  try {
    // Get user from our database
    const user = await getOrCreateUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { sessionId } = params;

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

export async function DELETE({ params }: { params: Params }) {
  try {
    // Get user from our database
    const user = await getOrCreateUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 1. Fetch Session from DB (Needed to verify ownership)
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, project: { select: { userId: true } } },
    });

    if (!session) {
      // If session doesn't exist in DB, no need to try removing it from the store
      // await removeSession(sessionId); // Skip this - we're not using Stagehand
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Verify Ownership against our database user
    if (session.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. In a production system, this is where you would clean up the browser session
    // For now, we'll skip the browser cleanup since we're not initializing Stagehand
    // await removeSession(sessionId); // Skip this - we're not using Stagehand

    // 4. Delete Session from DB
    await prisma.session.delete({
      where: { id: sessionId },
    });

    // 5. Return Success
    return new NextResponse(null, { status: 204 }); // No content on successful delete

  } catch (error) {
    console.error(`Error deleting session ${params.sessionId}:`, error);
    // No need to attempt cleanup since we're not using Stagehand
    // await removeSession(params.sessionId).catch(cleanupError => {...}); // Skip this
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 