import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function Tutorials() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-700 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Spindle Tutorials</h1>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">Beta</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* API Documentation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">API Reference</h3>
          </div>
          <div className="p-6">
            <p className="text-slate-600 mb-6">
              Spindle provides a comprehensive set of RESTful APIs that allow you to manage your browser automation projects and sessions programmatically.
            </p>

            {/* Projects API */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-slate-800 mb-4">Projects API</h4>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    <code className="text-sm font-mono text-slate-700">/api/v1/projects</code>
                  </div>
                  <p className="text-sm text-slate-600">Lists all projects for the authenticated user.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    <code className="text-sm font-mono text-slate-700">/api/v1/projects/[projectId]</code>
                  </div>
                  <p className="text-sm text-slate-600">Gets details for a specific project owned by the user.</p>
                </div>
              </div>
            </div>

            {/* Sessions API */}
            <div>
              <h4 className="text-lg font-medium text-slate-800 mb-4">Sessions API</h4>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">POST</span>
                    <code className="text-sm font-mono text-slate-700">/api/v1/sessions</code>
                  </div>
                  <p className="text-sm text-slate-600">Creates a new browser session (including starting a basic Docker container).</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    <code className="text-sm font-mono text-slate-700">/api/v1/sessions/[sessionId]</code>
                  </div>
                  <p className="text-sm text-slate-600">Gets details for a specific session, checks container status, and verifies ownership.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">DELETE</span>
                    <code className="text-sm font-mono text-slate-700">/api/v1/sessions/[sessionId]</code>
                  </div>
                  <p className="text-sm text-slate-600">Stops and removes the associated Docker container and deletes the session record.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">GET</span>
                    <code className="text-sm font-mono text-slate-700">/api/v1/sessions/[sessionId]/logs</code>
                  </div>
                  <p className="text-sm text-slate-600">Retrieves logs from the associated Docker container.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Usage */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Example Usage</h3>
          </div>
          <div className="p-6">
            <h4 className="text-lg font-medium text-slate-800 mb-2">Creating a new browser session</h4>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg mb-6 overflow-x-auto">
              <code>{`// Example: Creating a new browser session
fetch('/api/v1/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: 'your-project-id',
    // Additional configuration options
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}</code>
            </pre>

            <h4 className="text-lg font-medium text-slate-800 mb-2">Retrieving session details</h4>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
              <code>{`// Example: Getting session details
fetch('/api/v1/sessions/your-session-id')
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}</code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
} 