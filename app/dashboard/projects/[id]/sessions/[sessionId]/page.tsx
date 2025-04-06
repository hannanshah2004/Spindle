import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Globe, LayoutGrid, CheckCircle, XCircle } from "lucide-react"

type Props = {
  params: {
    id: string
    sessionId: string
  }
}

export default async function SessionDetailPage({ params }: Props) {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  const { id: projectId, sessionId } = params

  // In a real app, you would fetch this data from your database
  const session = {
    id: sessionId,
    projectId,
    status: sessionId.includes("1") ? "completed" : "failed",
    startUrl: "https://example.com",
    duration: sessionId.includes("1") ? "2m 15s" : "0m 45s",
    createdAt: "2023-04-05 14:30",
    completedAt: "2023-04-05 14:32",
    steps: [
      { id: "step_1", action: "navigate", target: "https://example.com", status: "success" },
      { id: "step_2", action: "click", target: ".signup-button", status: "success" },
      { id: "step_3", action: "fill", target: "#email", value: "test@example.com", status: "success" },
      { id: "step_4", action: "fill", target: "#password", value: "********", status: "success" },
      { id: "step_5", action: "click", target: ".submit-button", status: sessionId.includes("1") ? "success" : "error" },
    ]
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Session Details</h1>
            <span className={`text-xs px-2 py-1 rounded-full ${
              session.status === "completed" 
                ? "bg-emerald-100 text-emerald-600" 
                : "bg-red-100 text-red-600"
            }`}>
              {session.status}
            </span>
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
          <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Start URL</p>
                <p className="font-medium text-slate-700 truncate max-w-[150px]">{session.startUrl}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-violet-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Duration</p>
                <p className="font-medium text-slate-700">{session.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <LayoutGrid className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Steps</p>
                <p className="font-medium text-slate-700">{session.steps.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`${
                session.status === "completed" 
                  ? "bg-emerald-100" 
                  : "bg-red-100"
              } p-2 rounded-full`}>
                {session.status === "completed" 
                  ? <CheckCircle className="h-5 w-5 text-emerald-600" />
                  : <XCircle className="h-5 w-5 text-red-600" />
                }
              </div>
              <div>
                <p className="text-xs text-slate-500">Completion</p>
                <p className="font-medium text-slate-700">
                  {session.status === "completed" ? "Successful" : "Failed"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Session steps */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Session Steps</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {session.steps.map((step, index) => (
              <div key={step.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center ${
                    step.status === "success" 
                      ? "bg-emerald-100 text-emerald-600" 
                      : "bg-red-100 text-red-600"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-800 capitalize">{step.action}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        step.status === "success" 
                          ? "bg-emerald-100 text-emerald-600" 
                          : "bg-red-100 text-red-600"
                      }`}>
                        {step.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-mono bg-slate-50 px-1 py-0.5 rounded text-xs">
                        {step.target}
                      </span>
                      {step.value && (
                        <span className="ml-2">
                          with value: <span className="font-mono bg-slate-50 px-1 py-0.5 rounded text-xs">
                            {step.value}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
} 