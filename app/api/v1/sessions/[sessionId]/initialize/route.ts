import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/app/lib/user';
import { initializeStagehand, actOnSession } from '@/app/lib/stagehandManager';
import { z } from 'zod';
import { setTimeout } from 'timers/promises'; // Import setTimeout for async delay

const prisma = new PrismaClient();

// Validate the initialization request body
const initializeSchema = z.object({
  startUrl: z.string().url("Valid Start URL is required").min(1),
  nlpInstruction: z.string().optional(), // Instruction is optional
});

interface Params {
  sessionId: string;
}

export async function POST(request: Request, { params }: { params: Params }) {
  let stagehandInitialized = false;
  let sessionId: string | null = null; // Keep track for potential cleanup

  try {
    // 1. Authenticate User
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate Params
    const resolvedParams = await params;
    sessionId = resolvedParams.sessionId;
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 3. Validate request body
    let requestData;
    try {
      const body = await request.json();
      requestData = initializeSchema.parse(body);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: error instanceof z.ZodError ? error.format() : String(error) 
      }, { status: 400 });
    }

    // 4. Verify Session Exists and Belongs to User
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { project: { select: { userId: true } } },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (session.status !== 'created') {
      // Avoid re-initializing an already running/failed/completed session
      return NextResponse.json({ error: `Session already initialized with status: ${session.status}` }, { status: 409 }); 
    }

    // 5. Initialize Stagehand
    const stagehand = await initializeStagehand(sessionId); 
    stagehandInitialized = true; 

    // 6. Perform Initial Actions
    const { startUrl, nlpInstruction } = requestData;

    // Action 1: Use direct Playwright goto for initial navigation
    console.log(`Navigating session ${sessionId} directly to ${startUrl}`);
    await stagehand.page.goto(startUrl, { waitUntil: 'domcontentloaded' }); // Use Playwright's goto
    console.log(`Direct navigation complete for session ${sessionId}`);

    // Action 2: Perform NLP instruction if provided (still use actOnSession for LLM)
    if (nlpInstruction && nlpInstruction.trim() !== '') {
        await setTimeout(500); // Keep delay before LLM action
      console.log(`Performing NLP instruction for session ${sessionId}: "${nlpInstruction}"`);
      // We need actOnSession which uses the manager, let's ensure it uses the same instance
      await actOnSession(sessionId, nlpInstruction); 
      console.log(`NLP instruction complete for session ${sessionId}`);
    }

    // Update last used time after actions
    await prisma.session.update({
        where: { id: sessionId },
        data: { lastUsedAt: new Date() },
      });

    // 7. Return Success
    return NextResponse.json({ success: true, message: 'Session initialized and initial actions performed.' });

  } catch (error) {
    console.error(`Error during session initialization/action for session ${sessionId}:`, error);
    
    // If Stagehand was initialized but subsequent actions failed, status might be 'running'
    // We should update it to 'failed' to reflect the error.
    if (sessionId && stagehandInitialized) {
        try {
          await prisma.session.update({
            where: { id: sessionId },
            data: { status: 'failed' }
          });
        } catch (dbError) {
          console.error(`Failed to update session status to 'failed' for ${sessionId} after action error:`, dbError);
        }
    }
    // Note: If initializeStagehand itself failed, it already sets status to 'failed'.
    
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Session initialization or action failed', details: message }, { status: 500 });
  }
} 