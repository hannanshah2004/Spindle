"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"

export default function CreateProjectForm() {
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!projectName.trim()) {
      setError("Project name cannot be empty.")
      setIsLoading(false)
      return
    }

    try {
      // Use window.location.origin to get the base URL
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/v1/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: projectName }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create project")
      }

      // Clear the form and refresh the page to show the new project
      setProjectName("")
      router.refresh() // Refreshes the server component data
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(message)
      console.error("Project creation failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 mb-8">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              placeholder="Enter project name (e.g., Website Scraper)"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent disabled:opacity-50 text-slate-800 bg-white hover:border-slate-300 transition-all duration-200"
              required
              disabled={isLoading}
            />
            <p className="mt-1.5 text-sm text-slate-500">
              Give your project a descriptive name to easily identify it later.
            </p>
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

