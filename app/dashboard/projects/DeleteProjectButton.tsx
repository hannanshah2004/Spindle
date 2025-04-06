'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
  className?: string;
}

export default function DeleteProjectButton({ 
  projectId, 
  projectName,
  className = ''
}: DeleteProjectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    // Confirmation dialog first
    const confirmMessage = `Are you sure you want to delete the project "${projectName}"?\n\nThis will permanently delete all sessions and data associated with this project.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = window.location.origin;
      console.log(`[DeleteProjectButton] Deleting project: ${projectId}`);
      
      const response = await fetch(`${baseUrl}/api/v1/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        let errorMsg = 'Failed to delete project';
        try {
          const result = await response.json();
          errorMsg = result.error || result.message || errorMsg;
        } catch { /* Ignore if response body is not JSON */ }
        console.error(`[DeleteProjectButton] Deletion failed for project ${projectId}: Status ${response.status}`);
        throw new Error(errorMsg);
      }
      
      // Redirect to projects page
      router.push('/dashboard/projects');
      router.refresh();
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      console.error(`[DeleteProjectButton] Error deleting project ${projectId}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className={`flex items-center gap-1.5 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Delete project"
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete Project</span>
      {error && (
        <span className="text-sm text-red-600 ml-2">Error!</span>
      )}
    </button>
  );
} 