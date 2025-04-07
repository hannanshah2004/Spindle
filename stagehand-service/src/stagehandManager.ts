import { Stagehand, type AvailableModel, type ActResult } from '@browserbasehq/stagehand';

// Define the allowed models (keep this configuration)
const ALLOWED_MODELS: AvailableModel[] = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4o-2024-08-06',
  'gpt-4.5-preview',
];

// Map to store active Stagehand instances
const activeInstances = new Map<string, Stagehand>();

/**
 * Initialize a Stagehand instance for a session.
 * Launches the browser and prepares it.
 * @param sessionId The ID of the session
 * @returns The initialized Stagehand instance
 * @throws If initialization fails
 */
export async function initializeStagehand(sessionId: string): Promise<Stagehand> {
  if (activeInstances.has(sessionId)) {
    console.warn(`[Stagehand Manager] Initialization requested for already active session: ${sessionId}`);
    // Decide if we should return the existing instance or throw an error
    // Returning existing instance might be okay if the caller handles the state correctly
    return activeInstances.get(sessionId)!;
  }

  console.log(`[Stagehand Manager] Initializing Stagehand for session: ${sessionId}`);
  try {
    const requestedModel = process.env.STAGEHAND_MODEL_NAME;
    const modelName: AvailableModel =
      requestedModel && ALLOWED_MODELS.includes(requestedModel as AvailableModel)
      ? (requestedModel as AvailableModel)
      : 'gpt-4o';

    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error("[Stagehand Manager] Missing API Key (OPENAI_API_KEY or ANTHROPIC_API_KEY)");
        throw new Error("API key for the language model is not configured.");
    }

    const stagehandInstance = new Stagehand({
      env: 'LOCAL', // Correct for running browser on the same Docker host
      modelName: modelName,
      modelClientOptions: {
        apiKey: apiKey,
      },
      verbose: process.env.NODE_ENV !== 'production' ? 2 : 0, // Be less verbose in prod
      disablePino: true, // Keep Pino disabled
      localBrowserLaunchOptions: {
        // Make headless mode configurable via env var, default to true for prod
        headless: process.env.STAGEHAND_HEADLESS !== 'false', 
        // Add necessary args for running in Docker/Linux
        args: [
            '--disable-gpu',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage' // Often needed in constrained environments
        ]
      }
    });

    await stagehandInstance.init();
    activeInstances.set(sessionId, stagehandInstance);
    console.log(`[Stagehand Manager] Stagehand initialized successfully for session: ${sessionId}`);
    return stagehandInstance;

  } catch (error) {
    console.error(`[Stagehand Manager] Error initializing Stagehand for session ${sessionId}:`, error);
    // Ensure cleanup if init fails partially
    await removeStagehand(sessionId).catch(cleanupErr => {
        console.error(`[Stagehand Manager] Error during cleanup after initialization failure for ${sessionId}:`, cleanupErr);
    });
    throw error; // Re-throw the original error
  }
}

/**
 * Get an existing Stagehand instance.
 * Does NOT initialize if not found.
 * @param sessionId The ID of the session
 * @returns The Stagehand instance or undefined if not found.
 */
export function getStagehand(sessionId: string): Stagehand | undefined {
  return activeInstances.get(sessionId);
}

/**
 * Close and remove a Stagehand instance
 * @param sessionId The ID of the session
 * @returns A promise that resolves when cleanup is complete
 */
export async function removeStagehand(sessionId: string): Promise<void> {
  const instance = activeInstances.get(sessionId);
  console.log(`[Stagehand Manager] Attempting to remove Stagehand for session: ${sessionId}`);
  if (instance) {
    try {
      await instance.close();
      console.log(`[Stagehand Manager] Stagehand instance closed for session: ${sessionId}`);
    } catch (error) {
      console.error(`[Stagehand Manager] Error closing Stagehand instance for session ${sessionId}:`, error);
      // Decide if we should re-throw or just log
    } finally {
      activeInstances.delete(sessionId);
      console.log(`[Stagehand Manager] Stagehand instance removed from map for session: ${sessionId}`);
    }
  } else {
      console.warn(`[Stagehand Manager] removeStagehand called for non-existent session: ${sessionId}`);
  }
}

/**
 * Perform an action on a session using its Stagehand instance.
 * Also performs the initial navigation if the action requires it (e.g., page.goto)
 * @param sessionId The ID of the session
 * @param action The action instruction to perform
 * @returns The result of the action
 * @throws If the session is not found or the action fails
 */
export async function actOnSession(sessionId: string, action: string): Promise<ActResult> {
    console.log(`[Stagehand Manager] Action requested for session: ${sessionId}, Action: "${action}"`);
    const stagehand = getStagehand(sessionId);

    if (!stagehand) {
        console.error(`[Stagehand Manager] No active Stagehand instance found for session ${sessionId} during action.`);
        throw new Error(`Session ${sessionId} not initialized or already closed.`);
    }

    try {
        console.log(`[Stagehand Manager] Calling page.act for session ${sessionId}`);
        const result: ActResult = await stagehand.page.act({ action });
        console.log(`[Stagehand Manager] page.act completed for session ${sessionId}. Success: ${result?.success}`);
        // Do NOT include full result in logs by default unless debugging, could be large/sensitive
        // console.log(`Result:`, JSON.stringify(result, null, 2)); 
        return result;
    } catch (error) {
        console.error(`[Stagehand Manager] Error during page.act for session ${sessionId}, action "${action}":`, error);
        // Enhance error reporting if possible
        if (error instanceof Error) {
            console.error(`[Stagehand Manager] Act Error Name: ${error.name}`);
            console.error(`[Stagehand Manager] Act Error Message: ${error.message}`);
            if (error.stack) {
              console.error(`[Stagehand Manager] Act Error Stack: ${error.stack}`);
            }
        }
        // Re-throw a potentially more informative error or the original one
        throw new Error(`Action failed for session ${sessionId}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Performs the initial navigation for a session.
 * Should be called by the initialize handler after initializeStagehand succeeds.
 * @param sessionId 
 * @param startUrl 
 */
export async function navigateSession(sessionId: string, startUrl: string): Promise<void> {
    console.log(`[Stagehand Manager] Navigating session ${sessionId} to ${startUrl}`);
    const stagehand = getStagehand(sessionId);

    if (!stagehand) {
        console.error(`[Stagehand Manager] No active Stagehand instance found for session ${sessionId} during navigation.`);
        throw new Error(`Session ${sessionId} not initialized or already closed.`);
    }

    try {
        // Using playwright's goto directly for initial navigation
        await stagehand.page.goto(startUrl, { waitUntil: 'domcontentloaded' });
        console.log(`[Stagehand Manager] Navigation complete for session ${sessionId} to ${startUrl}`);
    } catch (navError) {
        console.error(`[Stagehand Manager] Navigation failed for session ${sessionId} to ${startUrl}:`, navError);
        // If navigation fails, the caller (initialize handler) should decide 
        // whether to terminate the session immediately.
        throw new Error(`Initial navigation to ${startUrl} failed for session ${sessionId}: ${navError instanceof Error ? navError.message : String(navError)}`);
    }
} 