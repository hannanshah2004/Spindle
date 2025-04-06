import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // To generate unique session IDs
import { Stagehand, type AvailableModel } from '@browserbasehq/stagehand'; // Import AvailableModel type
import { storeSession } from './sessionStore'; // ADD

// Define the allowed models explicitly based on Stagehand's expected types
// (Keep this updated if Stagehand adds more models)
const ALLOWED_MODELS: AvailableModel[] = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4o-2024-08-06',
  'gpt-4.5-preview',
  'claude-3-5-sonnet-latest',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-7-sonnet-latest',
  // Add other models supported by Stagehand's AvailableModel type if needed
];

const prisma = new PrismaClient();

interface RequestBody {
  projectId: string;
  // Add other necessary session creation parameters here (e.g., browser type, contextId?)
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all sessions where the associated project's userId matches
    const sessions = await prisma.session.findMany({
      where: {
        project: {
          userId: userId,
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

    // 2. Create and Initialize Stagehand Instance
    const sessionId = uuidv4();
    let stagehandInstance: Stagehand | undefined = undefined;
    try {
      // Determine the model name safely
      const requestedModel = process.env.STAGEHAND_MODEL_NAME;
      const modelName: AvailableModel = 
        requestedModel && ALLOWED_MODELS.includes(requestedModel as AvailableModel) 
        ? (requestedModel as AvailableModel) 
        : 'gpt-4o'; // Default to gpt-4o if env var is missing or invalid
        
      // TODO: Add OPENAI_API_KEY or ANTHROPIC_API_KEY to environment variables
      // TODO: Consider making modelName configurable via request body or project settings
      stagehandInstance = new Stagehand({
        env: 'LOCAL',
        modelName: modelName, // Use the validated model name
        modelClientOptions: {
            apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY, // Use appropriate key
        },
        verbose: 1
      });

      await stagehandInstance.init(); // Initialize the browser connection

      // Store the active instance
      storeSession(sessionId, stagehandInstance);

    } catch (stagehandError) {
        console.error("Stagehand initialization failed:", stagehandError);
        // Ensure partial resources aren't left hanging if init fails but instance was created
        // Now safe to check stagehandInstance as it's initialized to undefined
        if (stagehandInstance) await stagehandInstance.close().catch(err => console.error("Error closing failed Stagehand instance:", err));
        return NextResponse.json({ error: 'Failed to initialize browser session' }, { status: 500 });
    }

    // 3. Create Session record in DB
    const newSession = await prisma.session.create({
      data: {
        id: sessionId, // Use the generated sessionId
        status: 'running', // Initial status
        projectId: projectId,
        lastUsedAt: new Date(), // Set initial usage time
      },
    });

    // 4. Return the new session details (only the DB record)
    // We don't return the Stagehand instance itself
    return NextResponse.json(newSession, { status: 201 });

  } catch (error) {
    console.error("Error creating session:", error);
    // Attempt cleanup if a stagehand instance might exist in the map but DB failed
    // This part is tricky without knowing the exact session ID if DB insert fails
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 