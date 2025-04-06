'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface TerminateSessionButtonProps {
  sessionId: string;
}

export default function TerminateSessionButton({ sessionId }: TerminateSessionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleTerminate = async () => {
    if (!window.confirm('Are you sure you want to terminate this session? The browser instance will be closed, but the session log will remain.')) {
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = window.location.origin;
      console.log(`[TerminateButton] Terminating session (updating status): ${sessionId}`);
      
      const response = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      // Expect 200 OK with updated session data now
      if (!response.ok) { // Check for general non-OK status
        let errorMsg = 'Failed to terminate session';
        try {
            const result = await response.json();
            errorMsg = result.error || result.message || errorMsg;
        } catch { /* Ignore if response body is not JSON */ }
        console.error(`[TerminateButton] Termination failed for session ${sessionId}: Status ${response.status}`);
        throw new Error(errorMsg);
      }
      
      const updatedSessionData = await response.json(); // Get the updated session data
      console.log(`[TerminateButton] Session ${sessionId} terminated (status updated to ${updatedSessionData?.status}).`);
      
      // Refresh the current page to show the updated status ('completed')
      // This will re-fetch data in the server component
      router.refresh(); 
      
      // Optionally, could update local state immediately, but refresh is simpler

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      console.error(`[TerminateButton] Error terminating session ${sessionId}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <button
            onClick={handleTerminate}
            disabled={isLoading}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Trash2 className="h-3 w-3" />
            {isLoading ? 'Terminating...' : 'Terminate Session'}
        </button>
        {error && (
            <p className="text-sm text-red-600 mt-2">Error: {error}</p>
        )}
    </div>
  );
} 