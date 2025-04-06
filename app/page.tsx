import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { ArrowRight, CheckCircle } from "lucide-react"

export default async function Home() {
  const { userId } = await auth()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white font-sans">
      <header className="w-full py-4 px-6 md:px-10 flex justify-end items-center border-b border-slate-100">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">
            <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign in with Google
            </button>
          </Link>
        </SignedOut>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 md:px-10 py-12 md:py-16">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Welcome to Spindle
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The platform for running headless browsers with powerful automation capabilities
            </p>
          </div>

          <SignedIn>
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 w-full mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <p className="font-medium text-emerald-700">You are signed in!</p>
                </div>
                <p className="text-slate-600 text-sm">User ID: {userId}</p>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-emerald-700 bg-white border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 text-center w-full mb-12">
              <p className="text-amber-700 font-medium mb-2">
                Sign in with Google to access your personal browser automation
              </p>
              <p className="text-slate-600 text-sm">You&apos;ll be redirected to the dashboard after signing in</p>
            </div>
          </SignedOut>

          <div className="space-y-16">
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800">What is Spindle?</h2>
              <div className="text-slate-600 space-y-4">
                <p>
                  Spindle is a platform for running headless browsers. If you&apos;re building automations that need to
                  interact with websites, fill out forms, or replicate user actions, Spindle manages that infrastructure
                  so you don&apos;t have to maintain your own fleet of headless browsers.
                </p>
                <p>
                  It provides a simple API for controlling browsers, useful features for managing browser sessions, and
                  a scalable infrastructure for running them in production.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800">Key Features</h2>
              <p className="text-slate-600 mb-6">
                Not only does Spindle provide a simple API for controlling browsers, it also includes everything you
                need for integrating headless browsers into your application:
              </p>
              <ul className="grid gap-4">
                {[
                  {
                    title: "Framework Compatibility",
                    description:
                      "Native compatibility with Stagehand, Playwright, Puppeteer, Selenium and integrations with your favorite AI stacks.",
                  },
                  {
                    title: "Observability",
                    description: "Complete session visibility through Session Inspector and Session Replay.",
                  },
                  {
                    title: "Advanced Features",
                    description:
                      "Automatic captcha solving and residential proxies, Browser Extensions, File Management and long-running Sessions.",
                  },
                  {
                    title: "APIs",
                    description:
                      "An extensible platform with APIs to integrate a live browser view or retrieve logs and recordings.",
                  },
                ].map((feature, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <div className="mt-1 flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{feature.title}</h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800">Get Started</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Start with your favorite framework",
                    description: "Get started using Stagehand, Playwright, Puppeteer, or Selenium.",
                  },
                  {
                    title: "Get productive with our SDKs",
                    description: "Enable proxies, long-lived sessions, and manage downloaded files.",
                  },
                  {
                    title: "Spindle for AI",
                    description: "Add web browsing capabilities to your AI Agents with our automation framework.",
                  },
                  {
                    title: "Get full control with our APIs",
                    description: "Directly manage Sessions or integrate Spindle with your product.",
                  },
                ].map((card, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
                  >
                    <h3 className="font-semibold text-lg mb-2 text-slate-800">{card.title}</h3>
                    <p className="text-slate-600">{card.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex gap-6 items-center flex-col sm:flex-row justify-center mt-16">
            <Link
              href="/dashboard"
              className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 text-center shadow-sm hover:shadow transition-all duration-200 w-full sm:w-auto"
            >
              Try Spindle Now
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span>© 2025 Spindle</span>
            <span className="hidden sm:inline">•</span>
            <a href="#" className="hover:text-slate-800 transition-colors">
              Terms
            </a>
            <span className="hidden sm:inline">•</span>
            <a href="#" className="hover:text-slate-800 transition-colors">
              Privacy
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-800 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

