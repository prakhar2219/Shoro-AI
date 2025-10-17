# Education-AI Authentication System Guide

## 🚨 IMPORTANT: Dual Authentication System Detected

Your application currently has TWO authentication systems:
1. **Clerk** (Modern, managed auth service)
2. **Custom JWT** (Traditional backend auth)

**Current Status**: Custom JWT is active, Clerk is configured but NOT being used.

---

## Option A: Switch to Clerk (Recommended)

### Why Use Clerk?
- ✅ Professional user management dashboard
- ✅ Built-in email verification
- ✅ OAuth providers (Google, GitHub, etc.)
- ✅ Security best practices handled
- ✅ User management UI out of the box
- ✅ No password storage in your database

### Steps to Enable Clerk:

#### 1. Update Environment Variables

**Webapp `.env.local`:**
```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Clerk Webhook (for syncing users to MongoDB)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Get these keys from: https://dashboard.clerk.com

#### 2. Redirect Old Pages to Clerk Pages

**Option 2a - Simple Redirects (Recommended):**

Replace `/signup/page.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/sign-up');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to sign up...</p>
    </div>
  );
}
```

Replace `/login/page.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/sign-in');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to login...</p>
    </div>
  );
}
```

#### 3. Update Navbar Links

In `components/layout/navbar.tsx`, change:
- `/login` → `/sign-in`
- `/signup` → `/sign-up`

#### 4. Add Clerk Webhook Endpoint to API

**Create `/api/v1/users/clerk-sync` endpoint:**

`api/src/controllers/user.controller.ts` - Add:
```typescript
export const clerkSync = catchAsync(async (req: Request, res: Response) => {
  const { clerkId, email, name, profileImage, role } = req.body;

  let user = await User.findOne({ clerkId });

  if (!user) {
    user = await User.create({
      clerkId,
      email,
      name,
      profileImage,
      role: role || 'user',
      active: true,
    });
  } else {
    user.name = name;
    user.profileImage = profileImage;
    if (email) user.email = email;
    await user.save();
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const clerkDelete = catchAsync(async (req: Request, res: Response) => {
  const { clerkId } = req.params;
  
  await User.findOneAndUpdate(
    { clerkId },
    { active: false },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'User deactivated',
  });
});
```

`api/src/routes/user.routes.ts` - Add:
```typescript
// Public webhook endpoint (before auth middleware)
router.post('/clerk-sync', userController.clerkSync);
router.put('/clerk-sync', userController.clerkSync);
router.delete('/clerk-sync/:clerkId', userController.clerkDelete);
```

#### 5. Setup Clerk Webhook

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `http://your-domain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy webhook secret to `.env.local`

#### 6. Update Components to Use Clerk

Replace `useAuth()` calls with `useClerkAuthAdapter()`:

```typescript
import { useClerkAuthAdapter } from '@/hooks/useClerkAuth';

// In components:
const { user, isAuthenticated, login, logout } = useClerkAuthAdapter();
```

---

## Option B: Keep Custom JWT (Current System)

### If You Want to Continue with Custom JWT:

#### Pros:
- ✅ Full control over auth logic
- ✅ No third-party dependency
- ✅ Already implemented and working

#### Cons:
- ❌ No user management dashboard (unless you build one)
- ❌ Have to handle password resets manually
- ❌ Have to implement email verification
- ❌ Security is your responsibility

#### Users ARE Being Saved:
Your users ARE being saved to MongoDB! Check with:

**MongoDB Compass** or **CLI**:
```bash
# Connect to your MongoDB
mongo mongodb://localhost:27017/your_database_name

# View users
db.users.find().pretty()
```

**Or via API** (requires super_admin role):
```bash
curl http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Why They're Not in Clerk:
Custom JWT auth **does not sync** with Clerk. They are completely separate systems.

#### To Continue with Custom JWT:

1. **Remove Clerk dependencies** (if not using):
```bash
cd webapp
pnpm remove @clerk/nextjs

cd ../api
npm uninstall @clerk/express @clerk/clerk-sdk-node
```

2. **Or keep both** (for gradual migration):
- Keep current setup
- Users saved to MongoDB
- No Clerk dashboard visibility

---

## Current Architecture

### Database (MongoDB)
```
Users Collection:
{
  _id: ObjectId,
  clerkId: String (optional - for Clerk users),
  email: String (required),
  password: String (only for custom JWT users),
  name: String,
  role: 'super_admin' | 'admin' | 'editor' | 'user',
  active: Boolean,
  lastLogin: Date,
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Authentication Flow (Current - Custom JWT)
```
1. User → /signup page
2. POST /api/v1/auth/signup
3. Password hashed with bcrypt
4. User saved to MongoDB
5. JWT token generated
6. Token stored in localStorage
7. ✅ User authenticated
```

### Authentication Flow (Clerk - Not Active)
```
1. User → /sign-up page (Clerk)
2. Clerk handles signup
3. Webhook → /api/webhooks/clerk
4. User synced to MongoDB (no password)
5. Clerk session token managed
6. ✅ User authenticated
```

---

## Verification Commands

### Check if users exist in MongoDB:
```bash
# Via Mongo shell
mongo
use education-ai  # or your database name
db.users.find().pretty()

# Count users
db.users.count()

# Find recent users
db.users.find().sort({ createdAt: -1 }).limit(5).pretty()
```

### Check via API:
```bash
# First, login to get token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Then use token to view users (if you have admin access)
curl http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Recommendation

### For Production:
**Use Clerk** (Option A) - Better UX, security, and user management

### For Learning/Testing:
**Keep Custom JWT** (Option B) - You have full control and it's working

### Hybrid Approach:
Keep both but:
1. Redirect `/login` and `/signup` to Clerk pages
2. Keep custom auth as fallback
3. Support both `clerkId` and `password` in User model (already done!)

---

## Next Steps

Choose your option and follow the steps above. Let me know which direction you want to go!
