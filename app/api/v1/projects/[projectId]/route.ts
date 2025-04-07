import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/app/lib/user';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const segments = request.nextUrl.pathname.split('/');
    const projectId = segments[segments.length - 1];

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(project);

  } catch (error) {
    console.error(`Error fetching project by ID:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const segments = request.nextUrl.pathname.split('/');
    const projectId = segments[segments.length - 1];

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 1. Check project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        userId: true,
        sessions: {
          select: { 
            id: true,
            status: true
          }
        }
      },
    });

    if (!project) {
      return new NextResponse(null, { status: 204 });
    }

    if (project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Check for and clean up any running sessions
    const runningSessions = project.sessions.filter(s => s.status === 'running');
    if (runningSessions.length > 0) {
      console.log(`[DELETE /projects] Found ${runningSessions.length} running sessions to clean up`);
      
      // Import needed only when there are running sessions
      const { removeStagehand } = await import('@/app/lib/stagehandManager');
      
      // Clean up each running session
      for (const session of runningSessions) {
        try {
          console.log(`[DELETE /projects] Cleaning up running session: ${session.id}`);
          await removeStagehand(session.id);
        } catch (err) {
          // Log but continue - we want to delete the project anyway
          console.error(`[DELETE /projects] Error cleaning up session ${session.id}:`, err);
        }
      }
    }

    // 3. Delete the project (and cascading delete all sessions/actions)
    console.log(`[DELETE /projects] Deleting project ${projectId}`);
    await prisma.project.delete({
      where: { id: projectId },
    });
    console.log(`[DELETE /projects] Project ${projectId} deleted successfully`);

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`Error deleting project by ID:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 