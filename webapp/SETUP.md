# Education-AI WebApp Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Configuration

Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

Or create `.env.local` manually with:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Start the Development Server

**Option A: Start Both API and WebApp Together**
```bash
cd .. # Go to root directory
npm run dev:all
```

**Option B: Start WebApp Only** (API must be running separately)
```bash
pnpm dev
```

## Authentication

This app uses **JWT-based authentication** with the following endpoints:

- **Signup**: `POST /api/v1/auth/signup`
- **Login**: `POST /api/v1/auth/login`
- **Logout**: `POST /api/v1/auth/logout`
- **Refresh Token**: `POST /api/v1/auth/refresh`

The authentication context is provided by `AuthProvider` in `contexts/AuthContext.tsx`.

## Common Issues

### Issue: "Could not find /api/v1/auth/signup on this server!"

**Solution**: Make sure:
1. The API server is running on `http://localhost:8000`
2. The auth routes are registered in `api/src/server.ts` (already fixed)
3. `NEXT_PUBLIC_API_BASE_URL` is set in `.env.local`

### Issue: "useAuth must be used within an AuthProvider"

**Solution**: Already fixed - `AuthProvider` is now wrapped around the app in `app/layout.tsx`

### Issue: Favicon 404 Errors

**Solution**: Already fixed:
- Icon metadata added to `app/layout.tsx`
- Route validation added to `app/[countryCode]/page.tsx`

## API Configuration

The WebApp communicates with the backend API at:
- **Development**: `http://localhost:8000` (default)
- **Production**: Set via `NEXT_PUBLIC_API_BASE_URL` environment variable

The Next.js app automatically proxies `/api/v1/*` requests to the backend API via rewrites configured in `next.config.mjs`.

## Authentication Flow

1. User signs up or logs in via `/signup` or `/login` pages
2. Backend returns JWT `accessToken` and `refreshToken`
3. `accessToken` stored in localStorage and used for API requests
4. `refreshToken` stored in httpOnly cookie for security
5. Protected routes use the `useAuth()` hook to check authentication status

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Radix UI
- **Authentication**: Custom JWT + AuthContext
- **API Client**: Axios with custom instance
- **Forms**: React Hook Form + Zod validation

## Available Pages

- `/` - Home page
- `/login` - Login page
- `/signup` - Sign up page
- `/admin` - Admin dashboard (requires admin/editor role)
- `/[countryCode]` - Dynamic country pages
- `/profile` - User profile
- `/settings` - User settings

## Development Notes

- Hot reload is enabled for both frontend and backend
- TypeScript is configured with strict mode
- ESLint and Prettier are set up for code quality
- The app uses client-side and server-side rendering strategically
