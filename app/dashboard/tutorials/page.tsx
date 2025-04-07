import Link from "next/link"
import { ArrowLeft, BookOpen, Code, LifeBuoy, Terminal, FileCode, RefreshCw } from "lucide-react"

export default function Tutorials() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-white/90">
        <div className="mx-auto max-w-7xl px-6 py-5 sm:px-8 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-slate-900 flex items-center justify-center mr-1">
              <span className="text-white font-semibold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tutorials</h1>
            <span className="bg-slate-900/5 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">Beta</span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard"
              className="flex items-center justify-center p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">API Documentation</h2>
          <p className="text-slate-600 text-lg">
            Learn how to use Spindle&apos;s API to automate browser sessions programmatically.
          </p>
        </div>

        {/* API Documentation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 mb-12">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg">
              <Code className="h-5 w-5 text-slate-700" />
            </div>
            <h3 className="font-semibold text-slate-800 text-xl">API Reference</h3>
          </div>
          <div className="p-6">
            <p className="text-slate-600 mb-8 text-lg">
              Spindle provides a comprehensive set of RESTful APIs that allow you to manage your browser automation
              projects and sessions programmatically.
            </p>

            {/* Projects API */}
            <div className="mb-10">
              <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileCode className="h-5 w-5 text-slate-700" />
                Projects API
              </h4>
              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-md">
                      GET
                    </span>
                    <code className="text-sm font-mono text-slate-800">/api/v1/projects</code>
                  </div>
                  <p className="text-slate-600">Lists all projects for the authenticated user with session counts.</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-md">
                      GET
                    </span>
                    <code className="text-sm font-mono text-slate-800">/api/v1/projects/[projectId]</code>
                  </div>
                  <p className="text-slate-600">Gets details for a specific project owned by the user.</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded-md">POST</span>
                    <code className="text-sm font-mono text-slate-800">/api/v1/projects</code>
                  </div>
                  <p className="text-slate-600">Creates a new project for the authenticated user.</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-md">DELETE</span>
                    <code className="text-sm font-mono text-slate-800">/api/v1/projects/[projectId]</code>
                  </div>
                  <p className="text-slate-600">
                    Deletes a project and all its associated sessions. Automatically terminates any running browser
                    instances.
                  </p>
                </div>
              </div>
            </div>

            {/* Sessions API */}
            <div>
              <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-slate-700" />
                Sessions API
              </h4>
              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded-md">POST</span>
                    <code className="text-sm font-mono text-slate-800">/api/v1/sessions</code>
                  </div>
                  <p className="text-slate-600">Creates a new browser session with optional starting URL.</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-md">
                      GET
                    </span>
                    <code className="text-sm font-mono text-slate-800">/api/v1/sessions/[sessionId]</code>
                  </div>
                  <p className="text-slate-600">Gets details for a specific session including action history.</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-md">DELETE</span>
                    <code className="text-sm font-mono text-slate-800">/api/v1/sessions/[sessionId]</code>
                  </div>
                  <p className="text-slate-600">
                    Permanently deletes the session record and closes the browser instance if running.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded-md">POST</span>
                    <code className="text-sm font-mono text-slate-800">/api/v1/sessions/[sessionId]/terminate</code>
                  </div>
                  <p className="text-slate-600">
                    Terminates a running session (closes browser) but keeps the session log with completed status.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded-md">POST</span>
                    <code className="text-sm font-mono text-slate-800">/api/v1/sessions/[sessionId]/initialize</code>
                  </div>
                  <p className="text-slate-600">
                    Initializes the browser for a created session, changing status to running.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Usage */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 mb-12">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-slate-700" />
            </div>
            <h3 className="font-semibold text-slate-800 text-xl">Example Usage</h3>
          </div>
          <div className="p-6">
            <h4 className="text-lg font-medium text-slate-800 mb-3 flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-md text-white">
                <Code className="h-4 w-4" />
              </div>
              Creating a new browser session
            </h4>
            <pre className="bg-slate-900 text-slate-50 p-5 rounded-xl mb-8 overflow-x-auto shadow-sm">
              <code>{`// Example: Creating a new browser session
fetch('/api/v1/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: 'your-project-id',
    startUrl: 'https://example.com' // Optional starting URL
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}</code>
            </pre>

            <h4 className="text-lg font-medium text-slate-800 mb-3 flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-md text-white">
                <Code className="h-4 w-4" />
              </div>
              Deleting a project
            </h4>
            <pre className="bg-slate-900 text-slate-50 p-5 rounded-xl mb-8 overflow-x-auto shadow-sm">
              <code>{`// Example: Deleting a project with all its sessions
fetch('/api/v1/projects/your-project-id', {
  method: 'DELETE'
})
.then(response => {
  if (response.status === 204) {
    console.log('Project successfully deleted');
  }
})
.catch(error => console.error('Error:', error));`}</code>
            </pre>

            <h4 className="text-lg font-medium text-slate-800 mb-3 flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-md text-white">
                <Code className="h-4 w-4" />
              </div>
              Terminating vs. Deleting a session
            </h4>
            <pre className="bg-slate-900 text-slate-50 p-5 rounded-xl mb-8 overflow-x-auto shadow-sm">
              <code>{`// Terminate: Close browser but keep logs
fetch('/api/v1/sessions/your-session-id/terminate', {
  method: 'POST'
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Delete: Remove session completely
fetch('/api/v1/sessions/your-session-id', {
  method: 'DELETE'
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}</code>
            </pre>

            <h4 className="text-lg font-medium text-slate-800 mb-3 flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-md text-white">
                <Code className="h-4 w-4" />
              </div>
              Retrieving session details
            </h4>
            <pre className="bg-slate-900 text-slate-50 p-5 rounded-xl mb-8 overflow-x-auto shadow-sm">
              <code>{`// Example: Getting session details
fetch('/api/v1/sessions/your-session-id')
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}</code>
            </pre>
          </div>
        </div>

        {/* Session Lifecycle */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg">
              <RefreshCw className="h-5 w-5 text-slate-700" />
            </div>
            <h3 className="font-semibold text-slate-800 text-xl">Session Management</h3>
          </div>
          <div className="p-6">
            <h4 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-slate-700" />
              Session Lifecycle
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                <h5 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                  <div className="bg-slate-900 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  Creation
                </h5>
                <p className="text-slate-600">
                  Sessions start in the &apos;created&apos; status. The record is created in the database, but the browser is not
                  yet initialized.
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                <h5 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                  <div className="bg-slate-900 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  Initialization
                </h5>
                <p className="text-slate-600">
                  When a session is initialized, the browser is launched and the status changes to &apos;running&apos;.
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                <h5 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                  <div className="bg-slate-900 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                  Termination
                </h5>
                <p className="text-slate-600">
                  A running session can be terminated, which closes the browser but keeps the session log with a status
                  of &apos;completed&apos;.
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
                <h5 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                  <div className="bg-slate-900 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    4
                  </div>
                  Deletion
                </h5>
                <p className="text-slate-600">
                  A session in any state can be deleted, which permanently removes the session record and all associated
                  actions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

