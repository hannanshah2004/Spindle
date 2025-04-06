// Remove the Edge Runtime setting
// export const runtime = 'edge';

import { NextResponse } from 'next/server';
// Remove the auth import since we're using getOrCreateUser
// import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // To generate unique session IDs
// These imports will be needed when we implement Stagehand initialization
// import { Stagehand, type AvailableModel } from '@browserbasehq/stagehand';
// import { storeSession } from './sessionStore';
import { getOrCreateUser } from '@/app/lib/user';

// Define the allowed models (commented out until needed)
/*
const ALLOWED_MODELS: AvailableModel[] = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4o-2024-08-06',
  'gpt-4.5-preview',
  'claude-3-5-sonnet-latest',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-7-sonnet-latest',
];
*/

// Use a single PrismaClient instance
const prisma = new PrismaClient();

interface RequestBody {
  projectId: string;
  startUrl?: string;
  // Add other necessary session creation parameters here (e.g., browser type, contextId?)
}

export async function GET() {
  try {
    // Get user from our database instead of using auth() directly
    const user = await getOrCreateUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all sessions where the associated project's userId matches
    const sessions = await prisma.session.findMany({
      where: {
        project: {
          userId: user.id,
        },
      },
      include: {
        project: { // Optionally include basic project info
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // TODO: Optionally, iterate through sessions and check live container status?
    // For now, just returning the DB state.

    return NextResponse.json(sessions);

  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Get user from our database
    const user = await getOrCreateUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body: RequestBody = await request.json();
    const { projectId, startUrl } = body;

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
    
    // Check against our database user ID
    if (project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden - Project does not belong to user' }, { status: 403 });
    }

    // 2. Create a session ID and record in the database first
    const sessionId = uuidv4();
    
    // Create Session record with initial status
    const newSession = await prisma.session.create({
      data: {
        id: sessionId,
        status: 'created', // Initial status before Stagehand initialization
        projectId: projectId,
        lastUsedAt: new Date(),
        startUrl: startUrl || 'https://example.com', // Use provided URL or default
      },
    });

    // 3. Return session details first to keep API responsive
    // Any Stagehand initialization will happen separately when session is accessed
    return NextResponse.json(newSession, { status: 201 });

    /* NOTE: For a production app, we would:
     * 1. Create the session record (as we do now)
     * 2. Return the response immediately
     * 3. Use a background job or separate service to initialize Stagehand 
     * 4. Update the session status when initialization is complete
     */

  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 