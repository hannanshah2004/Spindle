import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Globe, LayoutGrid, CheckCircle, XCircle } from "lucide-react"
import { cookies } from 'next/headers'; // Import cookies for API fetch
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
// Uncomment AddActionForm import
import AddActionForm from "./AddActionForm";
import TerminateSessionButton from "./TerminateSessionButton"; // Import the terminate button

// Define types for session and step data
// Renamed from SessionStep to avoid confusion with actual steps vs recorded actions
interface SessionActionData {
  id: string;
  actionType: string; // e.g., 'navigate', 'nlp'
  details: string | null;
  status: string; // 'success' or 'failed'
  message: string | null;
  createdAt: string; // Assuming ISO string from DB
}

interface SessionData {
  id: string;
  projectId: string;
  status: string;
  startUrl: string | null; // Made nullable to match schema
  // Removed duration - we calculate it or it's not stored
  createdAt: string; // Assuming ISO string
  completedAt: string | null; // Assuming ISO string or null
  lastUsedAt: string | null; // Assuming ISO string or null
  actions: SessionActionData[]; // Array of actions performed
}

type Props = {
  params: {
    id: string
    sessionId: string
  }
}

// Updated function to fetch session details including actions
async function getSessionDetails(sessionId: string): Promise<SessionData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.API_BASE_URL || 'http://localhost:3000';
    const cookieStore: ReadonlyRequestCookies = await cookies();
    const cookieHeader = cookieStore.getAll().map((c: { name: string; value: string }) => `${c.name}=${c.value}`).join('; ');

    console.log(`[SessionDetailPage] Fetching ${baseUrl}/api/v1/sessions/${sessionId} (including actions)`);
    const response = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store', 
    });

    if (!response.ok) {
      console.error(`[SessionDetailPage] Failed to fetch session ${sessionId}:`, response.status, await response.text());
      return null;
    }

    const data = await response.json();
    console.log(`[SessionDetailPage] Fetched session data for ${sessionId}:`, JSON.stringify(data, null, 2));
    
    // Ensure the fetched data matches the SessionData structure
    // The API should now return the actions array directly
    return data as SessionData; // Cast directly assuming API matches SessionData

  } catch (error) {
    console.error(`[SessionDetailPage] Error fetching session ${sessionId}:`, error);
    return null;
  }
}

export default async function SessionDetailPage({ params }: Props) {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  // Await params before accessing properties
  const resolvedParams = await params;
  const { id: projectId, sessionId } = resolvedParams;

  console.log(`[SessionDetailPage] Rendering page for Project: ${projectId}, Session: ${sessionId}`);

  // Fetch session data from the API
  const session = await getSessionDetails(sessionId);

  // Handle session not found or fetch error
  if (!session) {
    // TODO: Show a proper error message or redirect
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-700 mb-4">Session Not Found or Error Fetching</h1>
          <Link href={`/dashboard/projects/${projectId}`} className="text-blue-600 hover:underline">
            Go back to Project
          </Link>
        </div>
      </div>
    );
  }
  
  // Now 'session' contains the actual data fetched from the API
  console.log(`[SessionDetailPage] Rendering with session status: ${session.status}`);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Session Details</h1>
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
          <div className="flex items-center gap-4">
             {/* Show Terminate Button only if session is running */}
             {session.status === 'running' && (
                <TerminateSessionButton sessionId={sessionId} projectId={projectId} />
             )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href={`/dashboard/projects/${projectId}`}
            className="flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Project
          </Link>
        </div>

        {/* Session overview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Session Overview</h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Start URL</p>
                <p className="font-medium text-slate-700 truncate max-w-[150px]">{session.startUrl ?? 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <LayoutGrid className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Actions Executed</p>
                <p className="font-medium text-slate-700">{session.actions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`${ 
                session.status === "completed" ? "bg-emerald-100" : 
                session.status === "running" ? "bg-yellow-100" :
                session.status === "created" ? "bg-blue-100" :
                "bg-red-100"
              } p-2 rounded-full`}>
                {session.status === "completed" 
                  ? <CheckCircle className="h-5 w-5 text-emerald-600" />
                  : session.status === "running" || session.status === "created"
                  ? <Clock className="h-5 w-5 text-yellow-600" /> 
                  : <XCircle className="h-5 w-5 text-red-600" />
                }
              </div>
              <div>
                <p className="text-xs text-slate-500">Completion</p>
                <p className="font-medium text-slate-700">
                  {session.status === "completed" ? "Successful" : 
                   session.status === "running" ? "In Progress" : 
                   session.status === "created" ? "Initializing" :
                   "Failed" }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Action Form Component - Use the actual component */}
        {/* Only show the form if the session is running */}
        {session.status === 'running' && (
           <AddActionForm sessionId={sessionId} />
        )}
        {session.status !== 'running' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8 p-5 text-center">
               <p className="text-sm text-slate-500">Cannot perform actions on a session that is not running (Status: {session.status}).</p>
            </div>
        )}

        {/* Session Actions List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Session Actions</h3>
          </div>
          {session.actions.length > 0 ? (
             <div className="divide-y divide-slate-100">
                {session.actions.map((action: SessionActionData, index: number) => (
                  <div key={action.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center text-xs ${ 
                        action.status === "success" ? "bg-emerald-100 text-emerald-600" : 
                        /* Default failed */ "bg-red-100 text-red-600"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-slate-800 capitalize">
                            {action.actionType === 'nlp' ? 'Instruction' : action.actionType}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${ 
                            action.status === "success" ? "bg-emerald-100 text-emerald-600" : 
                            "bg-red-100 text-red-600"
                          }`}>
                            {action.status}
                          </span>
                        </div>
                        {action.details && (
                            <p className="text-sm text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded my-1 break-words">
                              {action.details}
                            </p>
                        )}
                        {action.message && (
                            <p className="text-xs text-slate-500 mt-1">
                              {action.message}
                            </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                            {new Date(action.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
             <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-100 p-3 rounded-full mb-4">
                  <LayoutGrid className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-slate-800 font-medium mb-1">No actions recorded yet</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-4">
                  Perform actions using the form above (to be added).
                </p>
              </div>
          )}
        </div>
      </main>
    </div>
  )
} 