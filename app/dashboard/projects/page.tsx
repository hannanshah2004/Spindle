import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FolderPlus, Search, Calendar, Clock, ChevronRight } from "lucide-react"
import CreateProjectForm from "./CreateProjectForm"
import { cookies } from "next/headers"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

interface Project {
  id: string
  name: string
  createdAt: string
  sessionCount: number
}

async function getProjects(): Promise<Project[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.API_BASE_URL || "http://localhost:3000"
    const cookieStore: ReadonlyRequestCookies = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ")

    const response = await fetch(`${baseUrl}/api/v1/projects`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Failed to fetch projects:", response.status, await response.text())
      return []
    }
    const data = await response.json()
    return data as Project[]
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export default async function ProjectsPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/")
  }

  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-white/90">
        <div className="mx-auto max-w-7xl px-6 py-5 sm:px-8 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-slate-900 flex items-center justify-center mr-1">
              <span className="text-white font-semibold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Projects</h1>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard"
              className="flex items-center justify-center p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Your Projects</h2>
              <p className="text-slate-600">Manage and create browser automation projects</p>
            </div>
          </div>

          {/* Create Project Form */}
          <div className="mb-12">
            <CreateProjectForm />
          </div>

          {/* Projects list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <FolderPlus className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-800 text-xl">Project List</h3>
              </div>
              <span className="text-sm text-slate-500">
                {projects.length} {projects.length === 1 ? "project" : "projects"} total
              </span>
            </div>

            {projects.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {projects.map((project) => {
                  // Format date
                  const createdDate = new Date(project.createdAt)
                  const formattedDate = createdDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })

                  return (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className="flex items-center p-6 hover:bg-slate-50 transition-all duration-200 group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-slate-900 text-lg group-hover:text-slate-800">
                            {project.name}
                          </h3>
                          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                            {project.sessionCount} {project.sessionCount === 1 ? "session" : "sessions"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="h-4 w-4 mr-1.5" />
                          <span>Created on {formattedDate}</span>
                          <span className="mx-2">•</span>
                          <Clock className="h-4 w-4 mr-1.5" />
                          <span>Last updated {Math.floor(Math.random() * 24)} hours ago</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                <div className="bg-slate-900 p-4 rounded-xl mb-6 text-white">
                  <FolderPlus className="h-8 w-8" />
                </div>
                <h3 className="text-slate-800 font-semibold text-xl mb-2">No projects yet</h3>
                <p className="text-slate-600 text-base max-w-md mb-8">
                  Create your first project using the form above to start automating browser sessions
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 w-full max-w-md">
                  <h4 className="font-medium text-slate-800 mb-2">What you can do with projects:</h4>
                  <ul className="text-left text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="bg-slate-200 rounded-full p-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                      </div>
                      <span>Automate repetitive browser tasks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-slate-200 rounded-full p-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                      </div>
                      <span>Scrape data from websites</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-slate-200 rounded-full p-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                      </div>
                      <span>Run tests on your web applications</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

