'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'

interface AddActionFormProps {
  sessionId: string;
}

export default function AddActionForm({ sessionId }: AddActionFormProps) {
  const [actionInstruction, setActionInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // To refresh data after action

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!actionInstruction.trim()) return; // Don't submit empty actions

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = window.location.origin;
      console.log(`[AddActionForm] Performing action for session ${sessionId}: "${actionInstruction}"`);
      
      const response = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: actionInstruction }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`[AddActionForm] Action failed for session ${sessionId}:`, result);
        throw new Error(result.message || result.error || 'Failed to perform action');
      }
      
      console.log(`[AddActionForm] Action completed for session ${sessionId}:`, result);
      setActionInstruction(''); // Clear input on success
      router.refresh(); // Refresh server component data to show the new action/status

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      console.error(`[AddActionForm] Error submitting action for session ${sessionId}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
       <div className="p-5 border-b border-slate-100">
         <h3 className="font-semibold text-slate-800">Perform Next Action</h3>
       </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        <div>
          <label htmlFor="actionInstruction" className="sr-only">Action Instruction</label>
          <input
            type="text"
            id="actionInstruction"
            name="actionInstruction"
            placeholder="e.g., click login, search for your favorite mac and cheese recipe..."
            value={actionInstruction}
            onChange={(e) => setActionInstruction(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black"
            disabled={isLoading}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">Error: {error}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !actionInstruction.trim()} // Disable if loading or input empty
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            {isLoading ? 'Performing...' : 'Perform Action'}
          </button>
        </div>
      </form>
    </div>
  );
} 