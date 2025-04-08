import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express from 'express';
import { initializeSessionHandler, performActionHandler, terminateSessionHandler } from './handlers';

const app = express();
const port = process.env.PORT || 3001; // Use port 3001 or env variable

// Middleware to parse JSON bodies
app.use(express.json());

// --- Routes ---

// Initialize a new session (expects startUrl in body)
app.post('/sessions/:sessionId/initialize', initializeSessionHandler);

// Perform an action on an existing session (expects action in body)
app.post('/sessions/:sessionId/actions', performActionHandler);

// Terminate a session
app.delete('/sessions/:sessionId', terminateSessionHandler);

// --- Health Check --- (Good practice for services)
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).send('OK');
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`[Stagehand Service] Server listening on port ${port}`);
}); 