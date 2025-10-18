'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function AdminGuard({ 
  children, 
  allowedRoles = ['super_admin', 'admin', 'editor'] 
}: AdminGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Memoize allowedRoles to prevent infinite loops
  const memoizedRoles = useMemo(() => allowedRoles, [allowedRoles.join(',')]);

  useEffect(() => {
    if (!isLoaded) return;

    // Not logged in
    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Check role from Clerk public metadata
    const userRole = (user.publicMetadata?.role as string) || 'user';

    // Check if user has required role
    if (!memoizedRoles.includes(userRole)) {
      router.push('/'); // Redirect non-admin users to home
      return;
    }

    // User is authorized
    setIsAuthorized(true);
  }, [user, isLoaded, router, memoizedRoles]);

  // Loading state
  if (!isLoaded || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // User is authorized, show content
  return <>{children}</>;
}
