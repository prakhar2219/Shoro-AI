"use client";

import React, { useState, useEffect } from 'react';
import { Star, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Rating {
  _id: string;
  userName: string;
  rating: number;
  review?: string;
  createdAt: string;
  isVerified: boolean;
}

interface RatingStats {
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

interface RatingSystemProps {
  entityType: 'blog' | 'subject' | 'chapter' | 'topic' | 'gb_category' | 'gb_topic' | 'gb_subtopic' | 'gb_question';
  entityId: string;
  entityTitle: string;
}

export function RatingSystem({ entityType, entityId, entityTitle }: RatingSystemProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    rating: 0,
    review: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchRatings();
    fetchStats();
  }, [entityType, entityId]);

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/v1/ratings/${entityType}/${entityId}`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/v1/ratings/${entityType}/${entityId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch rating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName || !formData.rating) {
      toast({
        title: "Error",
        description: "Please provide your name and rating.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('/api/v1/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId,
          ...formData
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Thank you for your rating!",
        });
        
        // Reset form and refresh data
        setFormData({ userName: '', userEmail: '', rating: 0, review: '' });
        setShowForm(false);
        fetchRatings();
        fetchStats();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to submit rating",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Ratings & Reviews
        </h3>
        
        {stats && stats.totalRatings > 0 ? (
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              {renderStars(Math.round(stats.averageRating))}
              <span className="text-lg font-medium text-gray-900">
                {stats.averageRating.toFixed(1)}
              </span>
              <span className="text-gray-600">
                ({stats.totalRatings} review{stats.totalRatings !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">No ratings yet. Be the first to rate!</p>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Rating Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Rate "{entityTitle}"
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            {renderStars(formData.rating, true, (star) => 
              setFormData({ ...formData, rating: star })
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review (optional)
            </label>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your thoughts about this content..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Ratings List */}
      {ratings.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Reviews</h4>
          {ratings.map((rating) => (
            <div key={rating._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {rating.userName}
                      {rating.isVerified && (
                        <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </span>
                  </div>
                  {renderStars(rating.rating)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(rating.createdAt)}
                </div>
              </div>
              
              {rating.review && (
                <p className="text-gray-700 mt-2">{rating.review}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
