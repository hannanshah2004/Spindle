'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface TerminateSessionButtonProps {
  sessionId: string;
  projectId: string;
}

export default function TerminateSessionButton({ sessionId, projectId }: TerminateSessionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleTerminate = async () => {
    // Optional: Add a confirmation dialog
    if (!window.confirm('Are you sure you want to terminate this session? The browser instance will be closed.')) {
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = window.location.origin;
      console.log(`[TerminateButton] Terminating session: ${sessionId}`);
      
      const response = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      // DELETE returns 204 No Content on success
      if (!response.ok && response.status !== 204) {
        let errorMsg = 'Failed to terminate session';
        try {
            const result = await response.json();
            errorMsg = result.error || errorMsg;
        } catch { /* Ignore if response body is not JSON */ }
        console.error(`[TerminateButton] Termination failed for session ${sessionId}: Status ${response.status}`);
        throw new Error(errorMsg);
      }
      
      console.log(`[TerminateButton] Session ${sessionId} terminated successfully.`);
      // Redirect back to the project page after successful termination
      router.push(`/dashboard/projects/${projectId}`);
      // Optionally refresh project page data if needed after redirect
      // router.refresh(); // Use this carefully, might not be needed if redirecting

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