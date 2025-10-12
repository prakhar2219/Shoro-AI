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

// Admin functions
export const getAllRatings = async (params: {
  page: number;
  limit: number;
  search?: string;
  entityType?: string;
  isApproved?: boolean;
}) => {
  const { page, limit, search, entityType, isApproved } = params;
  const skip = (page - 1) * limit;
  
  // Build filter
  const filter: any = {};
  if (entityType && entityType !== 'all') filter.entityType = entityType;
  if (isApproved !== undefined) filter.isApproved = isApproved;
  if (search) {
    filter.$or = [
      { userName: { $regex: search, $options: 'i' } },
      { review: { $regex: search, $options: 'i' } },
      { userEmail: { $regex: search, $options: 'i' } }
    ];
  }

  const [ratings, total] = await Promise.all([
    RatingModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    RatingModel.countDocuments(filter)
  ]);

  return {
    data: ratings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};
