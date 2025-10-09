import { Request, Response } from 'express';
import * as ratingService from '../services/rating.service';
import { RatingInput } from '../types/rating.types';

export const createRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId, userName, userEmail, rating, review } = req.body;

    if (!entityType || !entityId || !userName || !rating) {
      res.status(400).json({ error: 'Missing required fields: entityType, entityId, userName, rating' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    // Check if user already rated this entity (if email provided)
    if (userEmail) {
      const existingRating = await ratingService.getUserRating(entityType, entityId, userEmail);
      if (existingRating) {
        res.status(409).json({ error: 'You have already rated this item' });
        return;
      }
    }

    const ratingData: RatingInput = {
      entityType,
      entityId,
      userName,
      userEmail,
      rating: Number(rating),
      review
    };

    const created = await ratingService.createRating(ratingData);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'You have already rated this item' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const getRatingsByEntity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const ratings = await ratingService.getRatingsByEntity(entityType, entityId);
    res.status(200).json(ratings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRatingStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const stats = await ratingService.getRatingStats(entityType, entityId);
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await ratingService.updateRating(id, req.body);
    
    if (!updated) {
      res.status(404).json({ error: 'Rating not found' });
      return;
    }

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await ratingService.deleteRating(id);
    
    if (!deleted) {
      res.status(404).json({ error: 'Rating not found' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
