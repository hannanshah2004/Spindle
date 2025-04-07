import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Remove SessionAction import
import { getOrCreateUser } from '@/app/lib/user';
import { actOnSession } from '@/app/lib/stagehandManager'; // Only need actOnSession
import { z } from 'zod';

const prisma = new PrismaClient();

// Validate the action request body
const actionSchema = z.object({
  action: z.string().min(1, "Action instruction is required")
});

interface Params {
  sessionId: string;
}

export async function POST(request: Request, { params }: { params: Params }) {
  let sessionId: string | null = null;

  try {
    // 1. Authenticate User
    const user = await getOrCreateUser();
    if (!user || !user.isAdmin) {
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
      requestData = actionSchema.parse(body);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: error instanceof z.ZodError ? error.format() : String(error) 
      }, { status: 400 });
    }

    // 4. Verify Session Exists, Belongs to User, and is Running
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { status: true, project: { select: { userId: true } } }, // Select only needed fields
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (session.status !== 'running') {
      return NextResponse.json({ error: `Session is not running (status: ${session.status}). Cannot perform actions.` }, { status: 409 }); 
    }

    // 5. Perform the Action using actOnSession from stagehandManager
    const actionResult = await actOnSession(sessionId, requestData.action);

    // 6. Record the Action in the Database
    try {
      await prisma.sessionAction.create({
        data: {
          sessionId: sessionId,
          actionType: 'nlp', // Assuming all actions from here are NLP for now
          details: requestData.action,
          status: actionResult.success ? 'success' : 'failed',
          message: actionResult.message,
        },
      });
      // Update session's lastUsedAt timestamp
      await prisma.session.update({ where: { id: sessionId }, data: { lastUsedAt: new Date() } });
    } catch (dbError) {
      console.error(`[Actions] Failed to record action or update timestamp for session ${sessionId}:`, dbError);
      // Don't fail the whole request, but log the error
    }

    // 7. Return the Result from actOnSession
    if (!actionResult.success) {
        // Return a 500 status if the action itself failed internally
        return NextResponse.json(actionResult, { status: 500 });
    }
    return NextResponse.json(actionResult);

  } catch (error) {
    // Catch errors from validation, DB checks, or unexpected issues in actOnSession
    console.error(`[Actions] Unexpected error for session ${sessionId}:`, error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    // Optionally update session status to failed here? Maybe not, depends on error type.
    return NextResponse.json({ error: 'Failed to perform action due to server error', details: message }, { status: 500 });
  }
} 