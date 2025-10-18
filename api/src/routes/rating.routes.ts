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

const router = Router();

// Create a new rating
router.post('/', createRating);

// Get all ratings for a specific entity
router.get('/:entityType/:entityId', getRatingsByEntity);

// Get rating statistics for a specific entity
router.get('/:entityType/:entityId/stats', getRatingStats);

// Update a rating
router.put('/:id', updateRating);

// Delete a rating
router.delete('/:id', deleteRating);

// Admin routes
router.get('/admin/all', getAllRatings);
router.patch('/admin/:id/approve', approveRating);
router.patch('/admin/:id/reject', rejectRating);

export default router;
