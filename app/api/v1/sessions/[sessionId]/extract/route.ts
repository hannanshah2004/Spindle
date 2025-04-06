import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/app/lib/user';
import { extractFromSession } from '@/app/lib/stagehandManager';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validate the extract request
const extractSchema = z.object({
  instruction: z.string().min(1, "Instruction is required"),
  useTextExtract: z.boolean().optional(),
  selector: z.string().optional()
});

interface Params {
  sessionId: string;
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    // Get authenticated user
    const user = await getOrCreateUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Await params before destructuring
    const resolvedParams = await params;
    const { sessionId } = resolvedParams;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // 1. Validate request body
    let requestData;
    try {
      const body = await request.json();
      requestData = extractSchema.parse(body);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: error instanceof z.ZodError ? error.format() : String(error) 
      }, { status: 400 });
    }

    // 2. Verify session exists and user has access
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

    // 3. Update lastUsedAt timestamp to keep track of activity
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastUsedAt: new Date() },
    });

    // 4. Perform extraction using our stagehandManager
    const result = await extractFromSession(
      sessionId, 
      requestData.instruction,
      {
        useTextExtract: requestData.useTextExtract,
        selector: requestData.selector
      }
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error(`Error extracting data from session ${params?.sessionId}:`, error);
    
    // If the error is from Stagehand, try to return a more helpful message
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
      
    return NextResponse.json({ error: 'Extraction failed', details: message }, { status: 500 });
  }
} 