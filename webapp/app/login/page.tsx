'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BookOpen } from 'lucide-react';

/**
 * Redirect page for backward compatibility
 * This ensures old /login links redirect to new /sign-in Clerk page
 */
export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Clerk sign-in page
    router.replace('/sign-in');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <BookOpen className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Redirecting to Sign In...
        </h2>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
      </div>
    </div>
  );
}
