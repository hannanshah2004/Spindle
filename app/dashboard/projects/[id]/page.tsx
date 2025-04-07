import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, CalendarDays, Play, ChevronRight, AlertCircle } from 'lucide-react'
import CreateSessionForm from "./CreateSessionForm"
import DeleteProjectButton from "../DeleteProjectButton"
import { cookies } from 'next/headers'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// type Props = {
//   params: {
//     id: string
//   }
// }

// Define types for API data
interface ProjectDetails {
  id: string;
  name: string;
  createdAt: string;
  // Add other fields if returned by GET /api/v1/projects/{id}
}

interface Session {
  id: string;
  projectId: string;
  status: string; // 'running', 'completed', 'failed', etc.
  createdAt: string;
  lastUsedAt: string;
  // Add other fields returned by GET /api/v1/sessions
}

// Fetch specific project details
async function getProjectDetails(projectId: string): Promise<ProjectDetails | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.API_BASE_URL || 'http://localhost:3000';
    const cookieStore: ReadonlyRequestCookies = await cookies();
    const cookieHeader = cookieStore.getAll().map((c: { name: string; value: string }) => `${c.name}=${c.value}`).join('; ');
    
    const response = await fetch(`${baseUrl}/api/v1/projects/${projectId}`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      console.error(`Failed to fetch project ${projectId}:`, response.status, await response.text());
      return null;
    }
    return (await response.json()) as ProjectDetails;
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    return null;
  }
}

// Fetch all sessions
async function getAllSessions(): Promise<Session[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.API_BASE_URL || 'http://localhost:3000';
    const cookieStore: ReadonlyRequestCookies = await cookies();
    const cookieHeader = cookieStore.getAll().map((c: { name: string; value: string }) => `${c.name}=${c.value}`).join('; ');
    
    const response = await fetch(`${baseUrl}/api/v1/sessions`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      console.error("Failed to fetch sessions:", response.status, await response.text());
      return [];
    }
    return (await response.json()) as Session[];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

export default async function ProjectDetailPage({ params }: any) {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  // const { id: projectId } = await params;
  const projectId = params.id

  // Fetch data in parallel
  const [project, allSessions] = await Promise.all([
    getProjectDetails(projectId),
    getAllSessions(),
  ]);

  // Handle project not found or fetch error
  if (!project) {
    // Redirect or show a 'not found' message
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans antialiased flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <div className="bg-slate-900 p-4 rounded-xl mb-6 text-white mx-auto w-16 h-16 flex items-center justify-center">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-semibold text-slate-800 mb-4">Project Not Found</h1>
          <Link href="/dashboard/projects" className="inline-flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // Filter sessions for the current project
  const projectSessions = allSessions.filter(session => session.projectId === projectId);
  // Sort sessions by creation date, newest first
  projectSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Determine last activity
  const lastActivityDate = projectSessions.length > 0 
    ? new Date(projectSessions[0].createdAt) // Assuming sorted newest first
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-white/90">
        <div className="mx-auto max-w-7xl px-6 py-5 sm:px-8 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-slate-900 flex items-center justify-center mr-1">
              <span className="text-white font-semibold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Project Details</h1>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard/projects"
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
              <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">{project.name}</h2>
              <p className="text-slate-600">Manage sessions and automation for this project</p>
            </div>
            <DeleteProjectButton 
              projectId={projectId} 
              projectName={project.name} 
              className="text-sm"
            />
          </div>

          {/* Project info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 mb-12">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Play className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-800 text-xl">Project Overview</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-xl shadow-sm text-white">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Created On</p>
                  <p className="font-medium text-slate-800 text-lg">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-xl shadow-sm text-white">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Sessions</p>
                  <p className="font-medium text-slate-800 text-lg">{projectSessions.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-xl shadow-sm text-white">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Last Activity</p>
                  <p className="font-medium text-slate-800 text-lg">
                    {lastActivityDate ? lastActivityDate.toLocaleDateString() : "No activity yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Use the Create Session Form Client Component */}
          <div className="mb-12">
            <CreateSessionForm projectId={projectId} />
          </div>

          {/* Sessions list - Use filtered & sorted data */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-800 text-xl">Session History</h3>
              </div>
              <span className="text-sm text-slate-500">{projectSessions.length} {projectSessions.length === 1 ? 'session' : 'sessions'} total</span>
            </div>

            {projectSessions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {projectSessions.map((session: Session) => {
                  // Format dates
                  const createdDate = new Date(session.createdAt);
                  const lastUsedDate = new Date(session.lastUsedAt);
                  
                  return (
                    <Link
                      key={session.id}
                      href={`/dashboard/projects/${projectId}/sessions/${session.id}`}
                      className="flex items-center p-6 hover:bg-slate-50 transition-all duration-200 group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`h-3 w-3 rounded-full ${ 
                                session.status === "completed" ? "bg-emerald-500" :
                                session.status === 'running' ? 'bg-yellow-500' :
                                session.status === 'failed' ? 'bg-red-500' :
                                session.status === 'created' ? 'bg-blue-500' :
                                "bg-slate-400" // Default grey for other statuses
                            }`}
                          ></div>
                          <span className="font-medium text-slate-800 truncate max-w-[150px] sm:max-w-[250px] md:max-w-[400px]">{session.id}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            session.status === "completed" ? "bg-emerald-100 text-emerald-600" : 
                            session.status === "running" ? "bg-yellow-100 text-yellow-600" : 
                            session.status === "failed" ? "bg-red-100 text-red-600" : 
                            session.status === "created" ? "bg-blue-100 text-blue-600" : 
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                          <CalendarDays className="h-4 w-4 mr-1.5" />
                          <span>Created: {createdDate.toLocaleString()}</span>
                          <span className="mx-2">•</span>
                          <Clock className="h-4 w-4 mr-1.5" />
                          <span>Last used: {lastUsedDate.toLocaleString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                <div className="bg-slate-900 p-4 rounded-xl mb-6 text-white">
                  <Play className="h-8 w-8" />
                </div>
                <h3 className="text-slate-800 font-semibold text-xl mb-2">No sessions yet</h3>
                <p className="text-slate-600 text-base max-w-md mb-8">
                  Create your first session using the form above to start automating
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 w-full max-w-md">
                  <h4 className="font-medium text-slate-800 mb-2">What you can do with sessions:</h4>
                  <ul className="text-left text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="bg-slate-200 rounded-full p-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                      </div>
                      <span>Run browser automation tasks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-slate-200 rounded-full p-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                      </div>
                      <span>Execute actions on websites</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-slate-200 rounded-full p-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                      </div>
                      <span>Monitor and track automation progress</span>
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
