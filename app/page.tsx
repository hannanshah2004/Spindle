import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { ArrowRight, CheckCircle } from "lucide-react"

export default async function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId } = await auth()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white font-sans antialiased">
      <header className="w-full py-5 px-6 md:px-12 flex justify-end items-center border-b border-slate-100 sticky top-0 backdrop-blur-sm bg-white/80 z-10 shadow-sm">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">
            <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium py-2.5 px-5 rounded-lg shadow-sm transition-all duration-200 hover:shadow hover:border-slate-300">
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

      <main className="flex-1 flex flex-col items-center px-6 md:px-12 py-16 md:py-24">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-block mb-3 px-4 py-1.5 bg-slate-900/5 rounded-full text-slate-700 text-sm font-medium">
              Browser Automation Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 tracking-tight leading-tight">
              Welcome to Spindle
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              The platform for running headless browsers with powerful automation capabilities
            </p>

            <Link
              href="/dashboard"
              className="mt-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 px-8 text-center shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base"
            >
              Try Spindle Now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-32">
            <section>
              <h2 className="text-3xl md:text-4xl font-bold mb-10 text-slate-800 tracking-tight">What is Spindle?</h2>
              <div className="text-slate-600 space-y-6 text-lg leading-relaxed">
                <p className="text-xl">
                  Spindle is a platform for running headless browsers. If you&apos;re building automations that need to
                  interact with websites, fill out forms, or replicate user actions, Spindle manages that infrastructure
                  so you don&apos;t have to maintain your own headless browsers.
                </p>
                <p className="text-xl">
                  It provides a simple API for controlling browsers, useful features for managing browser sessions, and
                  a scalable infrastructure for running them in production.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl md:text-4xl font-bold mb-10 text-slate-800 tracking-tight">Key Features</h2>
              <p className="text-slate-600 mb-12 text-xl leading-relaxed">
                Not only does Spindle provide a simple API for controlling browsers, it also includes everything you
                need for integrating headless browsers into your application:
              </p>
              <ul className="grid gap-8">
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
                  <li
                    key={index}
                    className="flex gap-6 items-start p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-slate-100"
                  >
                    <div className="mt-1 flex-shrink-0 bg-slate-900 p-3 rounded-xl shadow-sm">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-xl mb-2">{feature.title}</h3>
                      <p className="text-slate-600 text-lg">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-3xl md:text-4xl font-bold mb-10 text-slate-800 tracking-tight">Get Started</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                    className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 group"
                  >
                    <h3 className="font-semibold text-xl mb-3 text-slate-800 group-hover:text-slate-900">
                      {card.title}
                    </h3>
                    <p className="text-slate-600 text-lg">{card.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 mt-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span className="text-base font-medium">© 2025 Spindle</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

