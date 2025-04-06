'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'

interface CreateSessionFormProps {
  projectId: string;
}

export default function CreateSessionForm({ projectId }: CreateSessionFormProps) {
  const [startUrl, setStartUrl] = useState('https://example.com'); 
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    let sessionId: string | null = null;

    try {
      const baseUrl = window.location.origin;
      
      // Step 1: Create session record (only needs projectId, startUrl)
      console.log(`[CreateSessionForm] Creating session record for project ${projectId}...`);
      const createResponse = await fetch(`${baseUrl}/api/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectId: projectId,
          startUrl: startUrl,
        }), 
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        console.error('[CreateSessionForm] Failed to create session record:', errorData);
        throw new Error(errorData.error || 'Failed to create session record')
      }

      const newSession = await createResponse.json();
      sessionId = newSession.id;
      console.log(`[CreateSessionForm] Session record created: ${sessionId}`);

      // Step 2: Initialize the session (launch browser, navigate)
      console.log(`[CreateSessionForm] Initializing session: ${sessionId}`);
      const initResponse = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}/initialize`, {
        method: 'POST',
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        console.error(`[CreateSessionForm] Failed to initialize session ${sessionId}:`, errorData);
        // Attempt to clean up the session record if initialization fails
        // No await needed here, fire and forget cleanup
        fetch(`${baseUrl}/api/v1/sessions/${sessionId}`, { method: 'DELETE' });
        throw new Error(errorData.error || 'Failed to initialize session');
      }
      
      console.log(`[CreateSessionForm] Session ${sessionId} initialized successfully.`);

      // Step 3: Redirect to the session page on success
      router.push(`/dashboard/projects/${projectId}/sessions/${sessionId}`);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(message)
      console.error("[CreateSessionForm] Error during session creation/initialization:", err)
      // Don't automatically delete session record here - init step handles its own cleanup on failure
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Create New Session</h3>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="startUrl" className="block text-sm font-medium text-slate-900 mb-1">
              Starting URL
            </label>
            <input
              type="url"
              id="startUrl"
              name="startUrl"
              placeholder="https://example.com"
              value={startUrl}
              onChange={(e) => setStartUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              disabled={isLoading}
              required
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-600">Error: {error}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              {isLoading ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 