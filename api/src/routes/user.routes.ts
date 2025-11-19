import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { clerkProtect, clerkRestrictTo } from '../middleware/clerkAuth';

const router = Router();

// PUBLIC ROUTES - Clerk Webhook Endpoints (no authentication required)
// These must be defined BEFORE the clerkProtect middleware
router.post('/clerk-sync', userController.clerkSync);
router.put('/clerk-sync', userController.clerkSync);
router.delete('/clerk-sync/:clerkId', userController.clerkDelete);

// All routes below require authentication
router.use(clerkProtect);

// Current user routes - accessible by all authenticated users
router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Super Admin only routes
router.use(clerkRestrictTo('super_admin'));

// Clerk User Management (must be before /:id routes)
router.get('/clerk/list', userController.getClerkUsers);
router.patch('/clerk/:clerkId/role', userController.updateClerkUserRole);

// User management endpoints
router.get('/stats', userController.getUserStats);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.delete('/:id/hard', userController.hardDeleteUser);
router.patch('/:id/role', userController.updateUserRole);

export default router;
