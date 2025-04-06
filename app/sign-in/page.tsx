import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function SignInPage() {
  // If already signed in, redirect to dashboard
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn 
        path="/sign-in" 
        routing="path" 
        signUpUrl="/sign-up"
        redirectUrl="/dashboard"
      />
    </div>
  );
} 