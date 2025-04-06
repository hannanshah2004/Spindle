'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Bot } from 'lucide-react'

interface CreateSessionFormProps {
  projectId: string;
}

export default function CreateSessionForm({ projectId }: CreateSessionFormProps) {
  const [startUrl, setStartUrl] = useState('https://example.com'); 
  const [nlpInstruction, setNlpInstruction] = useState('');
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
      
      // Step 1: Create session record in DB
      const createResponse = await fetch(`${baseUrl}/api/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectId: projectId,
          startUrl: startUrl,
          nlpInstruction: nlpInstruction
        }), 
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Failed to create session record')
      }

      const newSession = await createResponse.json();
      sessionId = newSession.id;

      // Step 2: Initialize Stagehand and perform initial actions via new endpoint
      const initResponse = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startUrl: startUrl, 
          nlpInstruction: nlpInstruction
        }),
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        // Attempt to clean up the session record if initialization fails
        await fetch(`${baseUrl}/api/v1/sessions/${sessionId}`, { method: 'DELETE' });
        throw new Error(errorData.error || 'Failed to initialize session and perform actions');
      }

      // Step 3: Redirect to the session page on success
      router.push(`/dashboard/projects/${projectId}/sessions/${sessionId}`);
      // No need to call router.refresh() here as we are navigating away

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(message)
      console.error("Session creation/initialization failed:", err)
      // Optionally remove the session record if it was created but initialization failed later
      if (sessionId && !message.includes('Failed to create session record')) {
         // We already attempt deletion within the initResponse error handling
         // console.warn("Cleaning up session record after initialization failure...");
         // await fetch(`${window.location.origin}/api/v1/sessions/${sessionId}`, { method: 'DELETE' });
      }
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="nlpInstruction" className="flex items-center text-sm font-medium text-slate-900 mb-1">
              <Bot className="h-4 w-4 mr-1 text-slate-500" /> Initial Instruction (Optional)
            </label>
            <input
              type="text"
              id="nlpInstruction"
              name="nlpInstruction"
              placeholder="e.g., click the login button, extract the product title"
              value={nlpInstruction}
              onChange={(e) => setNlpInstruction(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black"
              disabled={isLoading}
            />
             <p className="mt-1 text-xs text-slate-700">Describe the first thing you want the session to do after navigating to the URL.</p>
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