import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../sessionStore'; // Adjust path as needed
import { z } from 'zod';
import { type ExtractOptions } from '@browserbasehq/stagehand';

const prisma = new PrismaClient();

interface Params {
  sessionId: string;
}

// Schema for the expected client request body
const clientInputSchema = z.object({
  instruction: z.string(),
  useTextExtract: z.boolean().optional(),
  selector: z.string().optional(),
});

// Define the Zod schema structure that THIS specific API endpoint
// expects Stagehand to extract and return.
// Example: Expecting an object containing a string field named 'data'.
const serverOutputSchema = z.object({
  data: z.string().describe("The extracted text or data as a string")
});
// Define the type based on the server output schema
type ServerOutputSchemaType = typeof serverOutputSchema;

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

    // 1. Validate Request Body against clientInputSchema
    let validatedInput: z.infer<typeof clientInputSchema>;
    try {
        const body = await request.json();
        const parseResult = clientInputSchema.safeParse(body);

        if (!parseResult.success) {
            // Use Zod's error formatting for better client feedback
            return NextResponse.json({ error: 'Invalid request body', details: parseResult.error.flatten() }, { status: 400 });
        }
        validatedInput = parseResult.data;
    } catch (error) {
      // Catch JSON parsing errors
      const message = error instanceof Error ? error.message : 'Invalid JSON payload';
      return NextResponse.json({ error: 'Invalid request body', details: message }, { status: 400 });
    }

    // 2. Get Active Stagehand Instance
    const stagehandInstance = getSession(sessionId);

    if (!stagehandInstance) {
        const dbSession = await prisma.session.findUnique({ where: { id: sessionId } });
        if (dbSession) {
            return NextResponse.json({ error: 'Session is inactive. Please create a new session.' }, { status: 404 });
        } else {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
    }

    // 3. Verify Ownership (Add TODO/Note as in /act)
    // *** PRODUCTION NOTE: Add proper ownership check here ***

    // 4. Perform the Extraction
    try {
      // Use the server-defined output schema
      const extractOptions: ExtractOptions<ServerOutputSchemaType> = {
        instruction: validatedInput.instruction,
        schema: serverOutputSchema, 
        useTextExtract: validatedInput.useTextExtract,
        selector: validatedInput.selector,
      };
      
      // Use the page object directly from the instance
      const result = await stagehandInstance.page.extract(extractOptions);
      
      // Update lastUsedAt in the background
      prisma.session.update({ 
          where: { id: sessionId }, 
          data: { lastUsedAt: new Date() } 
      }).catch(err => console.error(`Failed to update lastUsedAt for session ${sessionId}:`, err));

      return NextResponse.json(result);

    } catch (error) {
      console.error(`Error performing extraction in session ${sessionId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error performing extraction';
      return NextResponse.json({ error: 'Extraction failed', details: errorMessage }, { status: 500 });
    }

  } catch (error) {
    console.error(`Error in extract handler for session ${params.sessionId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown internal server error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
} 