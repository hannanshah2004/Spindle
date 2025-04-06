import { Stagehand, type AvailableModel } from '@browserbasehq/stagehand';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Define the allowed models
const ALLOWED_MODELS: AvailableModel[] = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4o-2024-08-06',
  'gpt-4.5-preview',
];

// Map to store active Stagehand instances
const activeInstances = new Map<string, Stagehand>();
const prisma = new PrismaClient();

/**
 * Initialize a Stagehand instance for a session
 * @param sessionId The ID of the session
 * @returns The initialized Stagehand instance
 */
export async function initializeStagehand(sessionId: string): Promise<Stagehand> {
  // Check if already initialized
  if (activeInstances.has(sessionId)) {
    return activeInstances.get(sessionId)!;
  }
  
  try {
    // Determine model name
    const requestedModel = process.env.STAGEHAND_MODEL_NAME;
    const modelName: AvailableModel = 
      requestedModel && ALLOWED_MODELS.includes(requestedModel as AvailableModel) 
      ? (requestedModel as AvailableModel) 
      : 'gpt-4o';
    
    // Create new Stagehand instance
    const stagehandInstance = new Stagehand({
      env: 'LOCAL',
      modelName: modelName,
      modelClientOptions: {
        apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
      },
      verbose: 1
    });
    
    // Initialize it
    await stagehandInstance.init();
    
    // Store in our active instances map
    activeInstances.set(sessionId, stagehandInstance);
    
    // Update session status to 'running'
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'running' }
    });
    
    return stagehandInstance;
  } catch (error) {
    console.error(`Error initializing Stagehand for session ${sessionId}:`, error);
    
    // Update session status to 'failed'
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'failed' }
    }).catch(dbError => {
      console.error(`Failed to update session status for ${sessionId}:`, dbError);
    });
    
    throw error;
  }
}

/**
 * Get an existing Stagehand instance or initialize a new one
 * @param sessionId The ID of the session
 * @returns The Stagehand instance
 */
export async function getStagehand(sessionId: string): Promise<Stagehand> {
  return activeInstances.has(sessionId) 
    ? activeInstances.get(sessionId)! 
    : await initializeStagehand(sessionId);
}

/**
 * Close and remove a Stagehand instance
 * @param sessionId The ID of the session
 * @returns A promise that resolves when cleanup is complete
 */
export async function removeStagehand(sessionId: string): Promise<void> {
  const instance = activeInstances.get(sessionId);
  
  if (instance) {
    try {
      await instance.close();
    } catch (error) {
      console.error(`Error closing Stagehand instance for session ${sessionId}:`, error);
    } finally {
      activeInstances.delete(sessionId);
    }
  }
}

/**
 * Perform an action on a session
 * @param sessionId The ID of the session 
 * @param action The action to perform
 * @returns The result of the action
 */
export async function actOnSession(sessionId: string, action: string) {
  const stagehand = await getStagehand(sessionId);
  return await stagehand.page.act({ action });
}

/**
 * Extract data from a session
 * @param sessionId The ID of the session
 * @param instruction The extraction instruction
 * @param options Additional options
 * @returns The extracted data
 */
export async function extractFromSession(
  sessionId: string, 
  instruction: string, 
  options: { 
    schema?: z.ZodObject<z.ZodRawShape>;
    useTextExtract?: boolean;
    selector?: string;
  } = {}
) {
  const stagehand = await getStagehand(sessionId);
  
  // For now, use a simple schema - would be customized for specific use cases
  const schema = options.schema || z.object({
    data: z.string().describe("The extracted data")
  });
  
  return await stagehand.page.extract({
    instruction,
    schema,
    ...options
  });
} 