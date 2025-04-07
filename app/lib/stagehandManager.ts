import { Stagehand, type AvailableModel, type ActResult } from '@browserbasehq/stagehand';
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
      verbose: 2,
      disablePino: true, // Disable Pino logger for Next.js compatibility
      localBrowserLaunchOptions: {
        headless: false // Launch browser visibly for debugging
      }
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
 * @returns An object indicating success or failure, and a message.
 */
export async function actOnSession(sessionId: string, action: string): Promise<{ success: boolean; message: string; result?: ActResult | null }> {
  try {
    console.log(`[StagehandManager] Getting Stagehand instance for session: ${sessionId}`);
    const stagehand = await getStagehand(sessionId);
    
    console.log(`[StagehandManager] Calling page.act for session ${sessionId} with action: "${action}"`);
    const result: ActResult = await stagehand.page.act({ action });
    
    console.log(`[StagehandManager] page.act completed for session ${sessionId}. Result:`, JSON.stringify(result, null, 2));
    
    return { 
      success: result?.success ?? false, 
      message: result?.message || 'Action completed, but no message returned.',
      result: result
    };

  } catch (error) {
    console.error(`[StagehandManager] Error during actOnSession for session ${sessionId}, action "${action}":`, error);
    let errorMessage = 'Unknown error during action';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error(`[StagehandManager] Act Error Name: ${error.name}`);
      console.error(`[StagehandManager] Act Error Message: ${errorMessage}`);
      if (error.stack) {
        console.error(`[StagehandManager] Act Error Stack: ${error.stack}`);
      }
    }
    return { 
      success: false, 
      message: `Action failed: ${errorMessage}`, 
      result: null
    };
  }
}

