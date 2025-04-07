import { Request, Response } from 'express';
import { 
    initializeStagehand, 
    actOnSession, 
    removeStagehand,
    navigateSession // Import the new navigation function
} from './stagehandManager';

// Initialize: Launch browser, then navigate
export const initializeSessionHandler = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { startUrl } = req.body;

    if (!startUrl) {
        return res.status(400).json({ success: false, error: 'startUrl is required in the request body' });
    }
    
    console.log(`[Handler] Initialize request for session ${sessionId} with URL ${startUrl}`);
    let stagehandInitialized = false;
    try {
        // 1. Initialize Stagehand (launch browser)
        await initializeStagehand(sessionId);
        stagehandInitialized = true;
        console.log(`[Handler] Stagehand initialized for ${sessionId}`);
        
        // 2. Perform Initial Navigation
        await navigateSession(sessionId, startUrl);
        console.log(`[Handler] Initial navigation complete for ${sessionId}`);
        
        // Respond with success *after* navigation
        res.status(200).json({ success: true, message: 'Session initialized and navigated successfully.' });

    } catch (error) {
        console.error(`[Handler] Error during initialization/navigation for session ${sessionId}:`, error);
        const message = error instanceof Error ? error.message : 'Unknown error';

        // Attempt cleanup if stagehand was initialized but navigation failed
        if (stagehandInitialized) {
            console.log(`[Handler] Attempting cleanup for session ${sessionId} after initialization/navigation error.`);
            await removeStagehand(sessionId).catch(cleanupErr => {
                console.error(`[Handler] Error during cleanup for session ${sessionId}:`, cleanupErr);
            });
        }
        
        // Respond with appropriate error status
        const statusCode = (error instanceof Error && error.message.includes("already active")) ? 409 : 500;
        res.status(statusCode).json({ success: false, error: 'Failed to initialize or navigate session', details: message });
    }
};

// Action: Perform an action using NLP
export const performActionHandler = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { action } = req.body;

    if (!action) {
        return res.status(400).json({ success: false, error: 'action is required in the request body' });
    }

    console.log(`[Handler] Action request for session ${sessionId}: "${action}"`);
    try {
        const result = await actOnSession(sessionId, action);
        console.log(`[Handler] Action completed for session ${sessionId}. Success: ${result.success}`);
        
        // Forward the result from stagehandManager
        // Respond with 200 if stagehand reported success, 500 otherwise (internal stagehand error)
        res.status(result.success ? 200 : 500).json(result);

    } catch (error) {
        console.error(`[Handler] Error performing action on session ${sessionId}:`, error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        // Check if the error is due to session not found vs. an internal action error
        const statusCode = (error instanceof Error && error.message.includes("not initialized")) ? 404 : 500;
        res.status(statusCode).json({ success: false, error: 'Failed to perform action', details: message });
    }
};

// Terminate: Close browser and cleanup
export const terminateSessionHandler = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    console.log(`[Handler] Terminate request for session ${sessionId}`);
    try {
        await removeStagehand(sessionId);
        console.log(`[Handler] Termination successful for session ${sessionId}`);
        res.status(200).json({ success: true, message: 'Session terminated successfully.' });
    } catch (error) {
        console.error(`[Handler] Error terminating session ${sessionId}:`, error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        // Usually termination failure is internal server error
        res.status(500).json({ success: false, error: 'Failed to terminate session', details: message });
    }
}; 