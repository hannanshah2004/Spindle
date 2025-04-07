import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // To generate unique session IDs
import { getOrCreateUser } from '@/app/lib/user';

// Use a single PrismaClient instance
const prisma = new PrismaClient();

// Simplified Request Body
interface RequestBody {
  projectId: string;
  startUrl?: string; 
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

    return NextResponse.json(sessions);

  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body: RequestBody = await request.json();
    // Only expect projectId and startUrl now
    const { projectId, startUrl } = body; 

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Validate Project ID and ownership (same as before)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden - Project does not belong to user' }, { status: 403 });
    }

    // Create session ID
    const sessionId = uuidv4();
    
    // Create Session record with 'created' status
    // No nlpInstruction field anymore
    const newSession = await prisma.session.create({
      data: {
        id: sessionId,
        status: 'created', // Start with 'created' status
        projectId: projectId,
        lastUsedAt: new Date(), // Set initial timestamp
        startUrl: startUrl || 'https://example.com', 
      },
    });

    // Return the created session details (including ID)
    return NextResponse.json(newSession, { status: 201 });

  } catch (error) {
    console.error("Error creating session record:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 