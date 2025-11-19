import { Router } from 'express';
import {
  createRating,
  getRatingsByEntity,
  getRatingStats,
  updateRating,
  deleteRating,
  getAllRatings,
  approveRating,
  rejectRating
} from '../controllers/rating.controller';
import { clerkProtect, clerkRestrictTo } from '../middleware/clerkAuth';

const router = Router();

// Public rating endpoints (GET operations) - no auth required
router.get('/:entityType/:entityId', getRatingsByEntity);
router.get('/:entityType/:entityId/stats', getRatingStats);

// Protected routes - require authentication
router.use(clerkProtect);

// Create, update, delete ratings (for authenticated users)
router.post('/', createRating);
router.put('/:id', updateRating);
router.delete('/:id', deleteRating);

// Admin-only routes - require admin role
router.use(clerkRestrictTo('super_admin', 'admin', 'editor'));

router.get('/admin/all', getAllRatings);
router.patch('/admin/:id/approve', approveRating);
router.patch('/admin/:id/reject', rejectRating);

export default router;
