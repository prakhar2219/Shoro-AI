import mongoose from 'mongoose';

export interface RatingInput {
  entityType: 'blog' | 'subject' | 'chapter' | 'topic';
  entityId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  review?: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface RatingResponse {
  _id: string;
  entityType: string;
  entityId: string;
  userName: string;
  rating: number;
  review?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
