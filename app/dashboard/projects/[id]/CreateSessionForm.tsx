'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'

interface CreateSessionFormProps {
  projectId: string;
}

export default function CreateSessionForm({ projectId }: CreateSessionFormProps) {
  // Add state for startUrl
  const [startUrl, setStartUrl] = useState('https://example.com'); 
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionCreated, setSessionCreated] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Use window.location.origin to get the base URL
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include projectId and startUrl in the body
        body: JSON.stringify({ 
          projectId: projectId,
          startUrl: startUrl 
        }), 
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create session')
      }

      // Get the new session ID from response
      const newSession = await response.json();
      setSessionId(newSession.id);
      setSessionCreated(true);

      // Refresh the server component data to show the new session
      router.refresh()

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(message)
      console.error("Session creation failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to navigate to session and provide a URL
  const navigateSession = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}/act`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: `navigate to ${startUrl}` 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to navigate');
      }
      
      // Redirect to session interface
      router.push(`/dashboard/projects/${projectId}/sessions/${sessionId}`);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Create New Session</h3>
      </div>
      <div className="p-5">
        {!sessionCreated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="startUrl" className="block text-sm font-medium text-slate-700 mb-1">
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
                {isLoading ? 'Creating...' : 'Start Session'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border border-green-100 bg-green-50 rounded-lg">
              <p className="text-green-700">Session created successfully!</p>
              <p className="text-sm text-green-600 mt-1">Session ID: {sessionId}</p>
            </div>
            
            <div>
              <label htmlFor="navigateUrl" className="block text-sm font-medium text-slate-700 mb-1">
                Navigate to URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="navigateUrl"
                  value={startUrl}
                  onChange={(e) => setStartUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  disabled={isLoading}
                />
                <button
                  onClick={navigateSession}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Navigate
                </button>
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-600">Error: {error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 