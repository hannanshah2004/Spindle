import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import Docker from 'dockerode';

const prisma = new PrismaClient();
const docker = new Docker();

interface Params {
  sessionId: string;
}

// Define a type for the Docker error structure we expect
interface ExpectedDockerError extends Error {
  statusCode?: number;
  reason?: string;
  json?: Record<string, unknown>;
}

export async function GET({ params }: { params: Params }) {
  try {
    const { userId } = await auth();
    const { sessionId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 1. Fetch Session from DB
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { project: true }, // Include project to verify ownership
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Verify Ownership
    if (session.project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. (Optional but recommended) Check Docker container status
    let containerStatus = session.status; // Default to DB status
    if (session.containerId) {
        try {
            const container = docker.getContainer(session.containerId);
            const data = await container.inspect();
            containerStatus = data.State.Status; // Update with live status
            
            // Optionally update DB status if different?
            if (session.status !== containerStatus) {
                await prisma.session.update({
                    where: { id: sessionId },
                    data: { status: containerStatus }
                });
                session.status = containerStatus; // Update the session object being returned
            }
        } catch (error) {
            const dockerError = error as ExpectedDockerError; // Use our defined type
            // If container not found (404), it might have been stopped/removed
            if (dockerError.statusCode === 404) {
                containerStatus = 'stopped'; // Or 'unknown' or 'error'
                // Update DB if needed
                if (session.status !== containerStatus) {
                    await prisma.session.update({
                        where: { id: sessionId },
                        data: { status: containerStatus, containerId: null } // Clear containerId
                    });
                    session.status = containerStatus;
                    session.containerId = null;
                }
            } else {
                console.error(`Error inspecting container ${session.containerId} for session ${sessionId}:`, dockerError);
                // Don't fail the request, just return DB status, but log error
            }
        }
    }

    // 4. Return Session Details (excluding project info)
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
    const { userId } = await auth();
    const { sessionId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 1. Fetch Session from DB
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { project: true }, // Include project to verify ownership
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Verify Ownership
    if (session.project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Stop and Remove Docker Container if it exists
    if (session.containerId) {
      try {
        const container = docker.getContainer(session.containerId);
        // Attempt to stop the container first (force kill after 10s)
        await container.stop({ t: 10 }).catch(err => {
            // Ignore 304 (not modified, already stopped) or 404 (not found)
            const stopError = err as ExpectedDockerError;
            if (stopError.statusCode !== 304 && stopError.statusCode !== 404) {
                console.warn(`Error stopping container ${session.containerId}:`, stopError.reason || stopError.message);
                // Continue to removal attempt even if stop fails
            }
        }); 
        // Remove the container
        await container.remove();
      } catch (error) {
        const removeError = error as ExpectedDockerError;
        // If container is already gone (404), that's okay for deletion
        if (removeError.statusCode !== 404) {
            console.error(`Error removing container ${session.containerId} for session ${sessionId}:`, removeError.reason || removeError.message);
            // Don't fail the whole delete if container removal fails, but log it
            // Consider updating session status to 'error'?
        }
      }
    }

    // 4. Delete Session from DB
    await prisma.session.delete({
      where: { id: sessionId },
    });

    // 5. Return Success
    return new NextResponse(null, { status: 204 }); // No content on successful delete

  } catch (error) {
    console.error(`Error deleting session ${params.sessionId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 