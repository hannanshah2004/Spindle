import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
  const user = await currentUser();
  
  // If user is not authenticated, redirect to home page
  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      
      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.firstName || 'User'}!</h2>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
            <p className="text-blue-800">You&apos;ve successfully signed in with Google.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* User information card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">Your Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
                <p>ID: {user.id}</p>
                <p>Account created: {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Navigation card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/" className="text-blue-600 hover:underline">
                    Return to home
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 