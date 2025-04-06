import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, CalendarDays, Play } from "lucide-react"
import CreateSessionForm from "./CreateSessionForm";
import { cookies } from 'next/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

type Props = {
  params: {
    id: string
  }
}

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

export default async function ProjectDetailPage({ params }: Props) {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  const projectId = params.id

  // Fetch data in parallel
  const [project, allSessions] = await Promise.all([
    getProjectDetails(projectId),
    getAllSessions(),
  ]);

  // Handle project not found or fetch error
  if (!project) {
    // Redirect or show a 'not found' message
    // redirect("/dashboard/projects?error=not_found"); // Option 1: Redirect
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-700 mb-4">Project Not Found</h1>
          <Link href="/dashboard/projects" className="text-blue-600 hover:underline">
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
            {/* <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
              {project.type} 
            </span> */}
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
                <p className="font-medium text-slate-700">{projectSessions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Activity</p>
                <p className="font-medium text-slate-700">
                  {lastActivityDate ? lastActivityDate.toLocaleDateString() : "No activity yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Use the Create Session Form Client Component */}
        <CreateSessionForm projectId={projectId} />

        {/* Sessions list - Use filtered & sorted data */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Session History</h3>
          </div>

          {projectSessions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {projectSessions.map((session: Session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/projects/${projectId}/sessions/${session.id}`}
                  className="block p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${ 
                            session.status === "completed" ? "bg-emerald-500" :
                            session.status === 'running' ? 'bg-yellow-500' :
                            session.status === 'failed' ? 'bg-red-500' :
                            session.status === 'created' ? 'bg-blue-500' :
                            "bg-slate-400" // Default grey for other statuses
                        }`}
                      ></div>
                      <span className="font-medium text-slate-700 truncate max-w-[150px] sm:max-w-[250px]">{session.id}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {session.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500" title={new Date(session.createdAt).toISOString()}>
                        {new Date(session.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-500">Last used: {new Date(session.lastUsedAt).toLocaleString()}</span>
                  </div>
                </Link>
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