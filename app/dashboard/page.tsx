import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Home, Zap, Plus } from "lucide-react"

export default async function Dashboard() {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Spindle Dashboard</h1>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">Beta</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
              <Home className="h-5 w-5" />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Welcome back, {user.firstName || "User"}</h2>
          <p className="text-slate-500">Here&apos;s what&apos;s happening with your browser automation today.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Get Started</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link 
                    href="/dashboard/projects"
                    className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="bg-white p-2 rounded-full border border-blue-100">
                      <Plus className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">View Projects</h4>
                      <p className="text-blue-600 text-sm">Start building your automation</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/dashboard/tutorials"
                    className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="bg-white p-2 rounded-full border border-purple-100">
                      <Zap className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800">View Tutorials</h4>
                      <p className="text-purple-600 text-sm">Learn how to use Spindle</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* User information card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Account Information</h3>
              </div>
              <div className="p-5">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Email Address</p>
                    <p className="text-sm text-slate-700 font-medium">{user.emailAddresses[0]?.emailAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">User ID</p>
                    <p className="text-sm text-slate-700 font-mono bg-slate-50 p-1 rounded border border-slate-100 overflow-x-auto">
                      {user.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Account Created</p>
                    <p className="text-sm text-slate-700">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

