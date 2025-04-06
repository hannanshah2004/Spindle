import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, FolderPlus, Search } from "lucide-react"

export default async function ProjectsPage() {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  // Sample data for projects
  const projects = [
    { id: "proj_1", name: "E-commerce Automation", createdAt: "2023-04-01", sessions: 5 },
    { id: "proj_2", name: "Data Scraping", createdAt: "2023-04-15", sessions: 3 },
    { id: "proj_3", name: "Form Submission", createdAt: "2023-05-01", sessions: 0 },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
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
            href="/dashboard" 
            className="flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Project creation card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Create New Project</h3>
          </div>
          <div className="p-5">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    placeholder="Enter project name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="projectType" className="block text-sm font-medium text-slate-700 mb-1">
                    Project Type
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="web_automation">Web Automation</option>
                    <option value="data_scraping">Data Scraping</option>
                    <option value="form_submission">Form Submission</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Link
                  href="/dashboard/projects/proj_new" // This would typically be handled by a form submission
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Project
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Projects list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Your Projects</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="block p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-slate-900">{project.name}</h3>
                    <span className="text-xs text-slate-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{project.sessions} sessions</span>
                    <span className="text-blue-600 hover:text-blue-800">View details →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-100 p-3 rounded-full mb-4">
                <FolderPlus className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-slate-800 font-medium mb-1">No projects yet</h3>
              <p className="text-slate-500 text-sm max-w-sm mb-4">
                Create your first project above to start automating browser sessions
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 