import mongoose from 'mongoose';

export interface RatingInput {
  entityType: 'blog' | 'subject' | 'chapter' | 'topic' | 'gb_category' | 'gb_topic' | 'gb_subtopic' | 'gb_question';
  entityId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  review?: string;
  isVerified?: boolean;
  isApproved?: boolean;
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
  entityType: 'blog' | 'subject' | 'chapter' | 'topic' | 'gb_category' | 'gb_topic' | 'gb_subtopic' | 'gb_question';
  entityId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  review?: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}
