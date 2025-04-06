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

export async function GET(_request: Request, { params }: { params: Params }) {
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

    // 3. Check if container exists
    if (!session.containerId) {
        return NextResponse.json({ error: 'Session container not found or already removed.' }, { status: 404 });
    }

    // 4. Fetch Logs from Docker Container
    try {
      const container = docker.getContainer(session.containerId);
      
      // Fetch logs - adjust options as needed (e.g., timestamps, tail)
      const logStream = await container.logs({
        stdout: true,
        stderr: true,
        follow: false, // Set to true for live streaming (would need different handling)
        timestamps: true, 
        tail: 1000 // Limit to the last 1000 lines
      });

      // Dockerode returns logs potentially as a Buffer or string
      let logs: string;
      if (Buffer.isBuffer(logStream)) {
        logs = logStream.toString('utf8');
      } else if (typeof logStream === 'string') {
        logs = logStream;
      } else {
          // Handle unexpected stream type - Dockerode's types can be tricky
          console.warn(`Unexpected log stream type for session ${sessionId}: ${typeof logStream}`);
          logs = "Could not retrieve logs due to unexpected format.";
      }
      
      // Return logs as plain text
      return new NextResponse(logs, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });

    } catch (error) {
      const dockerError = error as ExpectedDockerError;
      // Handle container not found specifically
      if (dockerError.statusCode === 404) {
        await prisma.session.update({
            where: { id: sessionId },
            data: { status: 'stopped', containerId: null }
        });
        return NextResponse.json({ error: 'Session container not found.' }, { status: 404 });
      } else {
        console.error(`Error fetching logs for session ${sessionId}:`, dockerError.reason || dockerError.message);
        return NextResponse.json({ error: 'Failed to retrieve session logs' }, { status: 500 });
      }
    }

  } catch (error) {
    console.error(`Error in log request for session ${params.sessionId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 