import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Globe, LayoutGrid, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cookies } from "next/headers"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import AddActionForm from "./AddActionForm"
import TerminateSessionButton from "./TerminateSessionButton"

// Define types for session and step data
interface SessionActionData {
  id: string
  actionType: string
  details: string | null
  status: string
  message: string | null
  createdAt: string
}

interface SessionData {
  id: string
  projectId: string
  status: string
  startUrl: string | null
  createdAt: string
  completedAt: string | null
  lastUsedAt: string | null
  actions: SessionActionData[]
}

// Moved this function back before the component definition
async function getSessionDetails(sessionId: string): Promise<SessionData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.API_BASE_URL || "http://localhost:3000"
    const cookieStore: ReadonlyRequestCookies = await cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ")

    console.log(`[SessionDetailPage] Fetching ${baseUrl}/api/v1/sessions/${sessionId} (including actions)`)
    const response = await fetch(`${baseUrl}/api/v1/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`[SessionDetailPage] Failed to fetch session ${sessionId}:`, response.status, await response.text())
      return null
    }

    const data = await response.json()
    console.log(`[SessionDetailPage] Fetched session data for ${sessionId}:`, JSON.stringify(data, null, 2))

    return data as SessionData
  } catch (error) {
    console.error(`[SessionDetailPage] Error fetching session ${sessionId}:`, error)
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function SessionDetailPage({ params }: any) {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  // Await params before accessing properties
  // const resolvedParams = await params
  // const { id: projectId, sessionId } = resolvedParams
  const projectId = params.id;
  const sessionId = params.sessionId;

  console.log(`[SessionDetailPage] Rendering page for Project: ${projectId}, Session: ${sessionId}`)

  // Fetch session data from the API
  const session = await getSessionDetails(sessionId)

  // Handle session not found or fetch error
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans antialiased flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <div className="bg-slate-900 p-4 rounded-xl mb-6 text-white mx-auto w-16 h-16 flex items-center justify-center">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-semibold text-slate-800 mb-4">Session Not Found</h1>
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="inline-flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back to Project
          </Link>
        </div>
      </div>
    )
  }

  // Now 'session' contains the actual data fetched from the API
  console.log(`[SessionDetailPage] Rendering with session status: ${session.status}`)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-white/90">
        <div className="mx-auto max-w-7xl px-6 py-5 sm:px-8 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-slate-900 flex items-center justify-center mr-1">
              <span className="text-white font-semibold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Session Details</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${
                session.status === "completed"
                  ? "bg-emerald-100 text-emerald-600"
                  : session.status === "running"
                    ? "bg-yellow-100 text-yellow-600"
                    : session.status === "failed"
                      ? "bg-red-100 text-red-600"
                      : session.status === "created"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-600"
              }`}
            >
              {session.status}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href={`/dashboard/projects/${projectId}`}
              className="flex items-center justify-center p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {/* Show Terminate Button only if session is running */}
            {session.status === "running" && <TerminateSessionButton sessionId={sessionId} />}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
                Session {session.id.substring(0, 8)}...
              </h2>
              <p className="text-slate-600">View and manage session actions and status</p>
            </div>
          </div>

          {/* Session overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 mb-12">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-lg">
                <LayoutGrid className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-800 text-xl">Session Overview</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-xl shadow-sm text-white">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Start URL</p>
                  <p className="font-medium text-slate-800 truncate max-w-[200px]">{session.startUrl ?? "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-xl shadow-sm text-white">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Actions Executed</p>
                  <p className="font-medium text-slate-800">{session.actions.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-xl shadow-sm text-white">
                  {session.status === "completed" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : session.status === "running" || session.status === "created" ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
                  <p className="font-medium text-slate-800">
                    {session.status === "completed"
                      ? "Successful"
                      : session.status === "running"
                        ? "In Progress"
                        : session.status === "created"
                          ? "Initializing"
                          : "Failed"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-200">
              <div className="flex items-center text-sm text-slate-500">
                <CalendarDays className="h-4 w-4 mr-1.5" />
                <span>Created: {new Date(session.createdAt).toLocaleString()}</span>
                {session.lastUsedAt && (
                  <>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span>Last activity: {new Date(session.lastUsedAt).toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Twitch Stream Embed */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                 {/* You might want a specific icon here */}
                 <div className="bg-slate-100 p-2 rounded-lg">
                    {/* Placeholder Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 4.5 18.75Z" />
                    </svg>
                 </div>
                 <h3 className="font-semibold text-slate-800 text-xl">Live Session View</h3>
              </div>
              <div className="p-6 aspect-video"> {/* Use aspect-video for 16:9 */}
                <iframe
                  src={`https://player.twitch.tv/?channel=spindlefeedec2&parent=${process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : 'localhost'}&muted=true`}
                  height="100%"
                  width="100%"
                  allowFullScreen={true}
                  className="w-full h-full border-0"
                  title="Twitch Stream for spindlefeedec2"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Add Action Form Component */}
          <div className="mb-12">
            {session.status === "running" ? (
              <AddActionForm sessionId={sessionId} />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 text-center">
                <div className="bg-slate-100 p-3 rounded-full mb-4 mx-auto w-12 h-12 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-slate-800 font-medium mb-2">Session Not Active</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Cannot perform actions on a session that is not running (Status: {session.status}).
                </p>
              </div>
            )}
          </div>

          {/* Session Actions List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <LayoutGrid className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-800 text-xl">Session Actions</h3>
              </div>
              <span className="text-sm text-slate-500">
                {session.actions.length} {session.actions.length === 1 ? "action" : "actions"} total
              </span>
            </div>

            {session.actions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {session.actions.map((action: SessionActionData, index: number) => (
                  <div key={action.id} className="p-6 hover:bg-slate-50 transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                          action.status === "success" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-800 capitalize text-lg">
                            {action.actionType === "nlp" ? "Instruction" : action.actionType}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full ${
                              action.status === "success"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {action.status}
                          </span>
                        </div>
                        {action.details && (
                          <div className="mb-3">
                            <p className="text-sm text-slate-600 font-mono bg-slate-50 px-4 py-3 rounded-lg my-2 break-words border border-slate-100">
                              {action.details}
                            </p>
                          </div>
                        )}
                        {action.message && <p className="text-sm text-slate-500 mb-2">{action.message}</p>}
                        <p className="text-xs text-slate-400">{new Date(action.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                <div className="bg-slate-900 p-4 rounded-xl mb-6 text-white">
                  <LayoutGrid className="h-8 w-8" />
                </div>
                <h3 className="text-slate-800 font-semibold text-xl mb-2">No actions recorded yet</h3>
                <p className="text-slate-600 text-base max-w-md mb-8">
                  {session.status === "running"
                    ? "Use the form above to perform actions in this session."
                    : "This session has no recorded actions."}
                </p>
                {session.status !== "running" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 w-full max-w-md">
                    <h4 className="font-medium text-slate-800 mb-2">What are session actions?</h4>
                    <ul className="text-left text-slate-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="bg-slate-200 rounded-full p-1 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                        </div>
                        <span>Browser navigation and interactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-slate-200 rounded-full p-1 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                        </div>
                        <span>Data extraction and form submissions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-slate-200 rounded-full p-1 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
                        </div>
                        <span>Natural language instructions</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function CalendarDays(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  )
}

