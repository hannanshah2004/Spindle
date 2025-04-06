import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Home, Settings, HelpCircle, BarChart3, Globe, Clock, Layers, CheckCircle2, ArrowUpRight } from "lucide-react"

export default async function Dashboard() {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  // Sample data for the dashboard
  const recentSessions = [
    { id: "sess_123", status: "completed", url: "https://example.com", duration: "2m 15s", timestamp: "2h ago" },
    { id: "sess_124", status: "completed", url: "https://google.com", duration: "5m 32s", timestamp: "3h ago" },
    { id: "sess_125", status: "failed", url: "https://github.com", duration: "1m 05s", timestamp: "Yesterday" },
  ]

  const stats = [
    { label: "Total Sessions", value: "24", icon: Layers, color: "bg-violet-100 text-violet-600" },
    { label: "Active Now", value: "2", icon: Clock, color: "bg-emerald-100 text-emerald-600" },
    { label: "Success Rate", value: "94%", icon: CheckCircle2, color: "bg-blue-100 text-blue-600" },
    { label: "Websites Accessed", value: "18", icon: Globe, color: "bg-amber-100 text-amber-600" },
  ]

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
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Welcome back, {user.firstName || "User"}</h2>
          <p className="text-slate-500">Here's what's happening with your browser automation today.</p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Success notification */}
            <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5">
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-full border border-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-800 mb-1">Account Connected Successfully</h3>
                  <p className="text-emerald-600 text-sm">
                    You've successfully signed in with Google and your account is ready to use.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent sessions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Recent Browser Sessions</h3>
                <button className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors">
                  View all <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {recentSessions.map((session, index) => (
                  <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${session.status === "completed" ? "bg-emerald-500" : "bg-red-500"}`}
                        ></div>
                        <span className="font-medium text-slate-700">{session.id}</span>
                      </div>
                      <span className="text-xs text-slate-500">{session.timestamp}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 truncate max-w-[200px]">{session.url}</span>
                      <span className="text-slate-500">{session.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage chart placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Usage Overview</h3>
                <div className="flex gap-2">
                  <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors">
                    Day
                  </button>
                  <button className="text-xs bg-slate-800 text-white px-2 py-1 rounded">Week</button>
                  <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors">
                    Month
                  </button>
                </div>
              </div>
              <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                  <BarChart3 className="h-5 w-5" />
                  <span>Usage statistics will appear here</span>
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

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Quick Actions</h3>
              </div>
              <div className="p-2">
                <nav className="space-y-1">
                  {[
                    { name: "Home", icon: Home, href: "/" },
                    { name: "Create New Session", icon: Globe, href: "#" },
                    { name: "View Documentation", icon: HelpCircle, href: "/docs" },
                    { name: "Account Settings", icon: Settings, href: "#" },
                  ].map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex items-center gap-3 p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Subscription status */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-sm text-white p-5">
              <h3 className="font-semibold mb-2">Free Plan</h3>
              <p className="text-slate-300 text-sm mb-4">You're currently on the free plan with limited features.</p>
              <div className="mb-4">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[35%]"></div>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-slate-300">35% used</span>
                  <span className="text-slate-300">7/20 sessions</span>
                </div>
              </div>
              <button className="w-full bg-white text-slate-800 hover:bg-slate-100 font-medium py-2 rounded-lg transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

