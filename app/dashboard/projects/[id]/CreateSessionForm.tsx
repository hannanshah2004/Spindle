"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Play, Loader2, Globe } from "lucide-react"

interface CreateSessionFormProps {
  projectId: string
}

export default function CreateSessionForm({ projectId }: CreateSessionFormProps) {
  const [startUrl, setStartUrl] = useState("https://example.com")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    let sessionId: string | null = null

    try {
      const baseUrl = window.location.origin

      // Step 1: Create session record (only needs projectId, startUrl)
      console.log(`[CreateSessionForm] Creating session record for project ${projectId}...`)
      const createResponse = await fetch(`${baseUrl}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectId,
          startUrl: startUrl,
        }),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        console.error("[CreateSessionForm] Failed to create session record:", errorData)
        throw new Error(errorData.error || "Failed to create session record")
      }

      const newSession = await createResponse.json()
      sessionId = newSession.id
      console.log(`[CreateSessionForm] Session record created: ${sessionId}`)

      // Step 2: Initialize the session (launch browser, navigate)
      console.log(`[CreateSessionForm] Initializing session: ${sessionId}`)
      const initResponse = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}/initialize`, {
        method: "POST",
      })

      if (!initResponse.ok) {
        const errorData = await initResponse.json()
        console.error(`[CreateSessionForm] Failed to initialize session ${sessionId}:`, errorData)
        // Attempt to clean up the session record if initialization fails
        // No await needed here, fire and forget cleanup
        fetch(`${baseUrl}/api/v1/sessions/${sessionId}`, { method: "DELETE" })
        throw new Error(errorData.error || "Failed to initialize session")
      }

      console.log(`[CreateSessionForm] Session ${sessionId} initialized successfully.`)

      // Step 3: Redirect to the session page on success
      router.push(`/dashboard/projects/${projectId}/sessions/${sessionId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(message)
      console.error("[CreateSessionForm] Error during session creation/initialization:", err)
      // Don't automatically delete session record here - init step handles its own cleanup on failure
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-lg">
          <Globe className="h-5 w-5 text-slate-700" />
        </div>
        <h3 className="font-semibold text-slate-800 text-xl">Create New Session</h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="startUrl" className="block text-sm font-medium text-slate-700 mb-2">
              Starting URL
            </label>
            <div className="relative">
              <input
                type="url"
                id="startUrl"
                name="startUrl"
                placeholder="https://example.com"
                value={startUrl}
                onChange={(e) => setStartUrl(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent disabled:opacity-50 text-slate-800 bg-white hover:border-slate-300 transition-all duration-200"
                disabled={isLoading}
                required
              />
            </div>
            <p className="mt-1.5 text-sm text-slate-500">Enter the URL where the browser session should start.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-start">
              <div className="bg-red-100 p-1 rounded-md mr-3 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

