import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, CalendarDays, Play } from "lucide-react"

type Props = {
  params: {
    id: string
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  const projectId = params.id

  // In a real app, you would fetch this data from your database
  const project = {
    id: projectId,
    name: projectId === "proj_1" ? "E-commerce Automation" : 
          projectId === "proj_2" ? "Data Scraping" : 
          projectId === "proj_3" ? "Form Submission" : "New Project",
    type: "web_automation",
    createdAt: "2023-04-01",
    sessions: [
      { 
        id: "sess_1", 
        status: "completed", 
        startUrl: "https://example.com", 
        duration: "2m 15s", 
        createdAt: "2023-04-05 14:30" 
      },
      { 
        id: "sess_2", 
        status: "failed", 
        startUrl: "https://example.com/checkout", 
        duration: "0m 45s", 
        createdAt: "2023-04-06 10:15" 
      },
    ]
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Project Details</h1>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/dashboard/projects" 
            className="flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Projects
          </Link>
        </div>

        {/* Project info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">{project.name}</h3>
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
              {project.type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-violet-100 p-2 rounded-full">
                <CalendarDays className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Created On</p>
                <p className="font-medium text-slate-700">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <Play className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Sessions</p>
                <p className="font-medium text-slate-700">{project.sessions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Activity</p>
                <p className="font-medium text-slate-700">
                  {project.sessions.length > 0 
                    ? new Date(project.sessions[0].createdAt).toLocaleDateString() 
                    : "No activity yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create new session */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Create New Session</h3>
          </div>
          <div className="p-5">
            <form className="space-y-4">
              <div>
                <label htmlFor="startUrl" className="block text-sm font-medium text-slate-700 mb-1">
                  Starting URL
                </label>
                <input
                  type="url"
                  id="startUrl"
                  name="startUrl"
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/dashboard/projects/${projectId}/sessions/new`}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Start Session
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Sessions list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Session History</h3>
          </div>

          {project.sessions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {project.sessions.map((session) => (
                <div key={session.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${session.status === "completed" ? "bg-emerald-500" : "bg-red-500"}`}
                      ></div>
                      <span className="font-medium text-slate-700">{session.id}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {session.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{session.createdAt}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate max-w-[200px]">{session.startUrl}</span>
                    <span className="text-slate-500">{session.duration}</span>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Link
                      href={`/dashboard/projects/${projectId}/sessions/${session.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-100 p-3 rounded-full mb-4">
                <Play className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-slate-800 font-medium mb-1">No sessions yet</h3>
              <p className="text-slate-500 text-sm max-w-sm mb-4">
                Create your first session above to start automating
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 