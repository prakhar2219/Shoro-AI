'use client';

import { useUser, useAuth as useClerkAuth, useSignIn, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'user';
  active: boolean;
  lastLogin?: Date;
  profileImage?: string;
  phoneNumber?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Custom hook that wraps Clerk's auth with our application's auth interface
 * This maintains backward compatibility with existing code using useAuth
 */
export function useClerkAuthAdapter() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut, getToken } = useClerkAuth();
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const router = useRouter();

  // Map Clerk user to our User interface
  const user: User | null = useMemo(() => {
    if (!clerkUser) return null;

    return {
      _id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      role: (clerkUser.publicMetadata?.role as any) || 'user',
      active: true,
      profileImage: clerkUser.imageUrl,
      phoneNumber: clerkUser.primaryPhoneNumber?.phoneNumber,
      department: clerkUser.publicMetadata?.department as string,
      createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : new Date(),
      updatedAt: clerkUser.updatedAt ? new Date(clerkUser.updatedAt) : new Date(),
      lastLogin: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : undefined,
    };
  }, [clerkUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!signIn || !setActiveSignIn) throw new Error('Sign in not loaded');

      try {
        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === 'complete' && result.createdSessionId) {
          await setActiveSignIn({ session: result.createdSessionId });
          
          // Redirect based on role (will be available in clerkUser after sign-in)
          // Using a small delay to allow clerkUser to update
          setTimeout(() => {
            const role = clerkUser?.publicMetadata?.role as string;
            if (['super_admin', 'admin', 'editor'].includes(role)) {
              router.push('/admin');
            } else {
              router.push('/');
            }
          }, 100);
        }
      } catch (error: any) {
        throw new Error(error.errors?.[0]?.message || 'Login failed');
      }
    },
    [signIn, setActiveSignIn, clerkUser, router]
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      if (!signUp || !setActiveSignUp) throw new Error('Sign up not loaded');

      try {
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');

        const result = await signUp.create({
          emailAddress: email,
          password,
          firstName,
          lastName: lastName || undefined,
        });

        // Send email verification
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

        // For now, we'll auto-verify in development
        // In production, you'd redirect to a verification page
        if (result.status === 'complete' && result.createdSessionId) {
          await setActiveSignUp({ session: result.createdSessionId });
          router.push('/');
        }
      } catch (error: any) {
        throw new Error(error.errors?.[0]?.message || 'Signup failed');
      }
    },
    [signUp, setActiveSignUp, router]
  );

  const logout = useCallback(async () => {
    await clerkSignOut();
    router.push('/sign-in');
  }, [clerkSignOut, router]);

  const updateUser = useCallback(
    async (data: Partial<User>) => {
      if (!clerkUser) throw new Error('No user logged in');

      try {
        // Update basic user information
        await clerkUser.update({
          firstName: data.name?.split(' ')[0],
          lastName: data.name?.split(' ').slice(1).join(' '),
        });

        // Note: publicMetadata (role, department) can only be updated from backend
        // If you need to update role or department, call your backend API:
        // PATCH /api/v1/users/{userId} with { department: data.department }
      } catch (error: any) {
        throw new Error(error.errors?.[0]?.message || 'Update failed');
      }
    },
    [clerkUser]
  );

  const hasRole = useCallback(
    (roles: string[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  // Get Clerk session token
  const getAccessToken = useCallback(async () => {
    try {
      return await getToken();
    } catch (error) {
      console.error('Error getting Clerk token:', error);
      return null;
    }
  }, [getToken]);

  return {
    user,
    accessToken: null, // Use getAccessToken() for async token retrieval
    getAccessToken, // Async method to get token
    loading: !isLoaded,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
    hasRole,
  };
}
