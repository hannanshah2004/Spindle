import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FolderPlus, Search } from "lucide-react"
import CreateProjectForm from "./CreateProjectForm";
import { cookies } from 'next/headers'; // Import cookies
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'; // Explicit type import

// Define type for Project data fetched from API
// TODO: Update this type if the API response changes (e.g., add session count)
interface Project {
  id: string;
  name: string;
  createdAt: string; // Assuming API returns ISO string
  sessionCount: number; // Add sessionCount field
  // sessions: number; // Add this when backend API supports it
}

// Function to fetch projects
async function getProjects(): Promise<Project[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.API_BASE_URL || 'http://localhost:3000';
    // Await cookies() as per runtime error message, despite potential linter confusion
    const cookieStore: ReadonlyRequestCookies = await cookies(); 
    const cookieHeader = cookieStore.getAll().map((c: { name: string; value: string }) => `${c.name}=${c.value}`).join('; ');
    
    const response = await fetch(`${baseUrl}/api/v1/projects`, {
      method: 'GET',
      headers: {
        // Forward cookies for authentication
        Cookie: cookieHeader
      },
      cache: 'no-store', 
    });

    if (!response.ok) {
      console.error("Failed to fetch projects:", response.status, await response.text());
      return []; 
    }
    const data = await response.json();
    return data as Project[]; 
  } catch (error) {
    console.error("Error fetching projects:", error);
    return []; 
  }
}

export default async function ProjectsPage() {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  // Fetch projects from the API
  const projects = await getProjects();

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

        {/* Use the Create Project Form Client Component */}
        <CreateProjectForm />

        {/* Projects list - Uses fetched data */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Your Projects</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                    <span className="text-slate-600">
                       {project.sessionCount} {project.sessionCount === 1 ? 'session' : 'sessions'}
                    </span>
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