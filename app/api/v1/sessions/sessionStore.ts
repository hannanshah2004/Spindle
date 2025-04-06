import { Stagehand } from '@browserbasehq/stagehand';

// WARNING: Simple in-memory store. Not suitable for production.
// Active sessions will be lost on server restart.
const activeSessions = new Map<string, Stagehand>();

export function storeSession(sessionId: string, stagehandInstance: Stagehand): void {
  activeSessions.set(sessionId, stagehandInstance);
}

export function getSession(sessionId: string): Stagehand | undefined {
  return activeSessions.get(sessionId);
}

export async function removeSession(sessionId: string): Promise<void> {
  const stagehandInstance = activeSessions.get(sessionId);
  if (stagehandInstance) {
    try {
      await stagehandInstance.close();
    } catch (error) {
      console.error(`Error closing Stagehand instance for session ${sessionId}:`, error);
      // Decide if we should still remove it from the map even if close fails
    }
    activeSessions.delete(sessionId);
  }
} 