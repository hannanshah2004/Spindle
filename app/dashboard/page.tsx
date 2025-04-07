import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Home, Zap, Plus, ChevronRight } from "lucide-react"

export default async function Dashboard() {
  const user = await currentUser()

  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-white/90">
        <div className="mx-auto max-w-7xl px-6 py-5 sm:px-8 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-slate-900 flex items-center justify-center mr-1">
              <span className="text-white font-semibold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <span className="bg-slate-900/5 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">Beta</span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="flex items-center justify-center p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200"
            >
              <Home className="h-5 w-5" />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
            Welcome back, {user.firstName || "User"}
          </h2>
          <p className="text-slate-600 text-lg">
            Here&apos;s what&apos;s happening with your browser automation today.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-xl">Get Started</h3>
                <span className="text-sm text-slate-500">Quick actions</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Link
                    href="/dashboard/projects"
                    className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-all duration-200 hover:shadow-lg group"
                  >
                    <div className="bg-slate-900 p-3 rounded-xl shadow-sm text-white">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 text-lg mb-1">View Projects</h4>
                      <p className="text-slate-600 text-base">Start building your automation</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </Link>

                  <Link
                    href="/dashboard/tutorials"
                    className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-all duration-200 hover:shadow-lg group"
                  >
                    <div className="bg-slate-900 p-3 rounded-xl shadow-sm text-white">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 text-lg mb-1">View Tutorials</h4>
                      <p className="text-slate-600 text-base">Learn how to use Spindle</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity Card - REPLACED */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-xl">Spindle Features</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { title: "Framework Compatibility", description: "Works with Playwright, Puppeteer, and Selenium"},
                  { title: "Browser Automation", description: "Control headless browsers with a simple API"},
                  { title: "AI Integration", description: "Add web browsing to your AI agents"},
                ].map((feature, index) => (
                  <div key={index} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="bg-slate-100 p-3 rounded-full">
                      <div className="h-2 w-2 rounded-full bg-slate-900"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{feature.title}</h4>
                      <p className="text-slate-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* User information card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-800 font-medium">{user.firstName?.[0] || user.lastName?.[0] || "U"}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-xl">Account</h3>
                  <p className="text-slate-500 text-sm">Personal information</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-2">Email Address</p>
                    <p className="text-base text-slate-700 font-medium">{user.emailAddresses[0]?.emailAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-2">User ID</p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto">
                      <p className="text-sm text-slate-700 font-mono">{user.id}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-2">Account Created</p>
                    <p className="text-base text-slate-700">
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

            {/* Spindle Image */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="p-6 flex justify-center items-center">
                <Image 
                  src="/spindle.png" 
                  alt="Spindle Logo" 
                  width={500}
                  height={300}
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

