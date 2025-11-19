// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// // Define public routes that don't require authentication
// const isPublicRoute = createRouteMatcher([
//   '/',
//   '/sign-in(.*)',
//   '/sign-up(.*)',
//   '/api/webhooks(.*)',
// ]);

// export default clerkMiddleware();

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// };
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes (no auth required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/v1/graphql',    // ✅ GraphQL allowed
  '/api/health',        // optional
  '/api/public(.*)',    // optional
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return; // Allow public access
  }
  
  // Protect everything else
  await auth();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Only protect app routes — NOT all API routes
    '/((?!api/v1/graphql).*)',
  ],
};
