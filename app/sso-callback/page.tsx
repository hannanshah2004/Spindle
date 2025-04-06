"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SSOCallbackPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to dashboard after authentication completes
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-900">Processing authentication...</p>
        <p className="text-sm text-gray-500 mt-2">You&apos;ll be redirected shortly.</p>
      </div>
    </div>
  );
} 