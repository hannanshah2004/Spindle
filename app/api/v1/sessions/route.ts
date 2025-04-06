import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid'; // To generate unique session IDs

const prisma = new PrismaClient();
const docker = new Docker(); // Connects to Docker daemon (defaults to local socket)

interface RequestBody {
  projectId: string;
  // Add other necessary session creation parameters here (e.g., browser type, contextId?)
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body: RequestBody = await request.json();
    const { projectId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // 1. Validate Project ID and ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden - Project does not belong to user' }, { status: 403 });
    }

    // 2. Create Docker Container (Basic Example - Needs more config)
    // TODO: Use a proper browser image, configure ports, environment variables etc.
    // TODO: Handle potential Docker errors more gracefully
    let container;
    try {
      container = await docker.createContainer({
        Image: 'ubuntu', // Placeholder: Replace with a headless browser image
        Cmd: ['/bin/bash', '-c', 'sleep 3600'], // Keep container alive
        Tty: false,
        // Add port bindings, volume mounts, env vars etc. as needed
        Labels: { 
          'spindle-session': 'true', // Identify Spindle containers
          'spindle-userId': userId,
          'spindle-projectId': projectId
        }
      });
      await container.start();
    } catch (dockerError) {
        console.error("Docker container creation/start failed:", dockerError);
        return NextResponse.json({ error: 'Failed to create browser session container' }, { status: 500 });
    }

    const containerId = container.id;

    // 3. Create Session record in DB
    const newSession = await prisma.session.create({
      data: {
        id: uuidv4(), // Generate a unique ID for the session
        containerId: containerId,
        status: 'running', // Initial status
        projectId: projectId,
        lastUsedAt: new Date(), // Set initial usage time
        // userId is implicitly linked through the project
      },
    });

    // 4. Return the new session details
    return NextResponse.json(newSession, { status: 201 });

  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 