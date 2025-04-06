'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'

interface CreateSessionFormProps {
  projectId: string;
}

export default function CreateSessionForm({ projectId }: CreateSessionFormProps) {
  // We can add state for startUrl etc. if the API needs it later
  // const [startUrl, setStartUrl] = useState(''); 
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        // Include projectId in the body as expected by the API
        body: JSON.stringify({ projectId: projectId }), 
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create session')
      }

      // Optionally get the new session ID from response if needed
      // const newSession = await response.json();

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Create New Session</h3>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Example input - keep or remove based on if API needs it */}
          {/* <div>
            <label htmlFor="startUrl" className="block text-sm font-medium text-slate-700 mb-1">
              Starting URL (Optional)
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
            />
          </div> */}
          
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
      </div>
    </div>
  )
} 