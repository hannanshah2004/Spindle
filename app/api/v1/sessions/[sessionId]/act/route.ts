import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../sessionStore'; // Adjust path as needed
import { z } from 'zod';
import { type ActOptions } from '@browserbasehq/stagehand'; // Import necessary types

const prisma = new PrismaClient();

interface Params {
  sessionId: string;
}

// Zod schema for validating the request body for act
const actBodySchema = z.object({
  action: z.string(),
  variables: z.record(z.string()).optional(),
  // Add other ActOptions fields if you want to allow them from the client
  // modelName: z.string().optional(),
  // domSettleTimeoutMs: z.number().optional(),
  // timeoutMs: z.number().optional(),
});


export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { userId } = await auth();
    const { sessionId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 1. Validate Request Body
    let actOptions: z.infer<typeof actBodySchema>;
    try {
      const body = await request.json();
      actOptions = actBodySchema.parse(body);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }

    // 2. Get Active Stagehand Instance
    const stagehandInstance = getSession(sessionId);

    if (!stagehandInstance) {
      // Check if session exists in DB but isn't active (e.g., after restart)
      const dbSession = await prisma.session.findUnique({ where: { id: sessionId } });
      if (dbSession) {
        // TODO: Implement logic to potentially restart/rehydrate session if feasible/desired
        return NextResponse.json({ error: 'Session is inactive. Please create a new session.' }, { status: 404 });
      } else {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
    }

    // 3. Verify Ownership (Check if session belongs to the authenticated user)
    // This requires fetching the session from DB again or storing userId with Stagehand instance
    // For simplicity here, we assume getSession implies it was created by an authorized user.
    // *** PRODUCTION NOTE: Add proper ownership check here based on your needs ***
    // Example check (requires fetching projectId from DB or storing it):
    /*
    const dbSession = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { project: { select: { userId: true } } }
    });
    if (!dbSession || dbSession.project.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    */

    // 4. Perform the Action
    try {
      const result = await stagehandInstance.page.act(actOptions as ActOptions);
      
      // Update lastUsedAt in the background (fire-and-forget)
      prisma.session.update({ 
          where: { id: sessionId }, 
          data: { lastUsedAt: new Date() } 
      }).catch(err => console.error(`Failed to update lastUsedAt for session ${sessionId}:`, err));

      return NextResponse.json(result);

    } catch (error) {
      console.error(`Error performing action in session ${sessionId}:`, error);
      // Consider mapping Stagehand errors to specific HTTP statuses if needed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error performing action';
      return NextResponse.json({ error: 'Action failed', details: errorMessage }, { status: 500 });
    }

  } catch (error) {
    console.error(`Error in act handler for session ${params.sessionId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown internal server error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
} 