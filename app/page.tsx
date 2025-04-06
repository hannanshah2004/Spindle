import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full flex justify-end p-4">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in">
            <button className="flex items-center gap-2 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 font-medium py-2 px-4 rounded shadow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Sign in with Google
            </button>
          </Link>
        </SignedOut>
      </header>
      
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 text-center">Welcome to Spindle</h1>
        
        <SignedIn>
          <div className="bg-green-100 p-4 rounded-md border border-green-200 w-full">
            <p className="text-green-700">You are signed in! User ID: {userId}</p>
            <Link href="/dashboard" className="mt-2 inline-block text-blue-600 underline">
              Go to Dashboard
            </Link>
          </div>
        </SignedIn>
        
        <SignedOut>
          <div className="bg-yellow-100 p-4 rounded-md border border-yellow-200 text-center w-full">
            <p className="text-yellow-700 mb-4">Sign in with Google to access your personal browser automation</p>
            <p className="text-gray-600 text-sm">You&apos;ll be redirected to the dashboard after signing in</p>
          </div>
        </SignedOut>
        
        <div className="prose prose-lg max-w-none w-full">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">What is Spindle?</h2>
            <p>
              Spindle is a platform for running headless browsers. If you&apos;re building automations that need to interact with websites, 
              fill out forms, or replicate user actions, Spindle manages that infrastructure so you don&apos;t have to maintain your own fleet of 
              headless browsers.
            </p>
            <p className="mt-2">
              It provides a simple API for controlling browsers, useful features for managing browser sessions, and a scalable 
              infrastructure for running them in production.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Key Features</h2>
            <p>
              Not only does Spindle provide a simple API for controlling browsers, it also includes everything you need for integrating 
              headless browsers into your application:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Framework Compatibility:</strong> Spindle has native compatibility with Stagehand, Playwright, Puppeteer, Selenium 
              and integrations with your favorite AI stacks.</li>
              <li><strong>Observability:</strong> Complete session visibility through Session Inspector and Session Replay.</li>
              <li><strong>Advanced Features:</strong> Automatic captcha solving and residential proxies, Browser Extensions, 
              File Management and long-running Sessions.</li>
              <li><strong>APIs:</strong> An extensible platform with APIs to integrate a live browser view or retrieve logs and recordings.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Get Started</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-lg mb-2">Start with your favorite framework</h3>
                <p className="text-gray-600">Get started using Stagehand, Playwright, Puppeteer, or Selenium.</p>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-lg mb-2">Get productive with our SDKs</h3>
                <p className="text-gray-600">Enable proxies, long-lived sessions, and manage downloaded files.</p>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-lg mb-2">Spindle for AI</h3>
                <p className="text-gray-600">Add web browsing capabilities to your AI Agents with our automation framework.</p>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-lg mb-2">Get full control with our APIs</h3>
                <p className="text-gray-600">Directly manage Sessions or integrate Spindle with your product.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex gap-6 items-center flex-col sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 text-center"
          >
            Try Spindle Now
          </Link>
          <Link
            href="/docs"
            className="rounded-lg border border-gray-300 hover:bg-gray-50 font-medium py-3 px-6 text-center"
          >
            Read the Docs
          </Link>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-500 mt-10">
        <span>© 2025 Spindle</span>
        <span>•</span>
        <a href="#" className="hover:text-blue-600">Terms</a>
        <span>•</span>
        <a href="#" className="hover:text-blue-600">Privacy</a>
        <span>•</span>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">GitHub</a>
      </footer>
    </div>
  );
}
