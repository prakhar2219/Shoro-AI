import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Define the expected shape of public metadata
interface PublicMetadata {
  role?: string;
  department?: string;
}

/**
 * Server-side helper to check if user has required role
 * Use this in Server Components or Server Actions
 */
export async function requireRole(allowedRoles: string[]) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Access role from public metadata with proper typing
  const metadata = sessionClaims?.publicMetadata as PublicMetadata;
  const role = metadata?.role || 'user';

  if (!allowedRoles.includes(role)) {
    redirect('/'); // Redirect to home if not authorized
  }

  return { userId, role };
}

/**
 * Check if user is admin (super_admin, admin, or editor)
 */
export async function requireAdmin() {
  return requireRole(['super_admin', 'admin', 'editor']);
}
