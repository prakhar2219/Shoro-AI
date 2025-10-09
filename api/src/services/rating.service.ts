import RatingModel from '../models/rating.model';
import { RatingInput, RatingStats } from '../types/rating.types';

export const createRating = async (data: RatingInput) => {
  return await RatingModel.create(data);
};

export const getRatingsByEntity = async (entityType: string, entityId: string) => {
  return await RatingModel.find({
    entityType,
    entityId,
    isApproved: true
  })
  .sort({ createdAt: -1 })
  .select('-userEmail'); // Don't expose email addresses
};

export const getRatingStats = async (entityType: string, entityId: string): Promise<RatingStats> => {
  const ratings = await RatingModel.find({
    entityType,
    entityId,
    isApproved: true
  }).select('rating');

  const totalRatings = ratings.length;
  
  if (totalRatings === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  const averageRating = Math.round((sum / totalRatings) * 10) / 10; // Round to 1 decimal

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach(rating => {
    distribution[rating.rating as keyof typeof distribution]++;
  });

  return {
    averageRating,
    totalRatings,
    ratingDistribution: distribution
  };
};

export const updateRating = async (id: string, data: Partial<RatingInput>) => {
  return await RatingModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteRating = async (id: string) => {
  return await RatingModel.findByIdAndDelete(id);
};

export const getUserRating = async (entityType: string, entityId: string, userEmail: string) => {
  return await RatingModel.findOne({
    entityType,
    entityId,
    userEmail
  });
};
