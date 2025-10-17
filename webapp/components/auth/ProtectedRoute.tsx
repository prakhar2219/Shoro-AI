'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // Not logged in - redirect to sign-in
    if (!user) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check role if required
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = (user.publicMetadata?.role as string) || 'user';
      
      if (!requiredRoles.includes(userRole)) {
        // User doesn't have required role
        router.push('/');
        return;
      }
    }

    // User is authorized
    setIsAuthorized(true);
  }, [user, isLoaded, requiredRoles, router, pathname]);

  // Loading state
  if (!isLoaded || (user && !isAuthorized)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return null;
  }

  // Not authorized
  if (requiredRoles && requiredRoles.length > 0 && !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
