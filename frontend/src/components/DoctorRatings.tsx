// 🌟 Doctor Rating Display Component
import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Award, Heart, ThumbsUp, TrendingUp } from 'lucide-react';

interface DoctorRatingsProps {
  doctorId: number;
  showDetailedView?: boolean;
}

interface RatingData {
  averageRating: number;
  totalRatings: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  categoryAverages: {
    communication: number;
    professionalism: number;
    knowledge: number;
    satisfaction: number;
  };
  recommendationRate: number;
  recentRatings: Array<{
    id: number;
    rating: number;
    comment: string;
    communicationRating?: number;
    professionalismRating?: number;
    knowledgeRating?: number;
    overallSatisfaction?: number;
    wouldRecommend: boolean;
    isAnonymous: boolean;
    patientName: string;
    createdAt: string;
  }>;
}

const DoctorRatings: React.FC<DoctorRatingsProps> = ({ 
  doctorId, 
  showDetailedView = false 
}) => {
  const [ratings, setRatings] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
  }, [doctorId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/ratings/doctor/${doctorId}`);
      
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      } else {
        setError('Failed to load ratings');
      }
    } catch (err) {
      setError('Error loading ratings');
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const StarDisplay = ({ rating, size = 'w-5 h-5' }: { rating: number; size?: string }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );

  const RatingBar = ({ label, value, total }: { label: string; value: number; total: number }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600 w-8">{label}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 w-8">{value}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600">
        {error}
      </div>
    );
  }

  if (!ratings || ratings.totalRatings === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No ratings yet</p>
      </div>
    );
  }

  // Compact view for doctor cards
  if (!showDetailedView) {
    return (
      <div className="flex items-center space-x-2">
        <StarDisplay rating={ratings.averageRating} />
        <span className="text-sm text-gray-500">
          ({ratings.totalRatings} review{ratings.totalRatings !== 1 ? 's' : ''})
        </span>
        {ratings.recommendationRate >= 80 && (
          <div className="flex items-center space-x-1 text-green-600">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">{ratings.recommendationRate}%</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed view for doctor profile pages
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Patient Reviews</h3>
        <div className="flex items-center justify-center space-x-4">
          <StarDisplay rating={ratings.averageRating} size="w-8 h-8" />
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{ratings.averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">
              Based on {ratings.totalRatings} review{ratings.totalRatings !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Rating Distribution</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar
              key={star}
              label={`${star}★`}
              value={ratings.ratingBreakdown[star as keyof typeof ratings.ratingBreakdown]}
              total={ratings.totalRatings}
            />
          ))}
        </div>
      </div>

      {/* Category Ratings */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Communication</p>
            <StarDisplay rating={ratings.categoryAverages.communication} />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Award className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Professionalism</p>
            <StarDisplay rating={ratings.categoryAverages.professionalism} />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Medical Knowledge</p>
            <StarDisplay rating={ratings.categoryAverages.knowledge} />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Heart className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Satisfaction</p>
            <StarDisplay rating={ratings.categoryAverages.satisfaction} />
          </div>
        </div>
      </div>

      {/* Recommendation Rate */}
      <div className="flex items-center justify-center space-x-2 mb-6 p-4 bg-green-50 rounded-lg">
        <ThumbsUp className="w-5 h-5 text-green-600" />
        <span className="text-lg font-semibold text-green-700">
          {ratings.recommendationRate}% of patients recommend this doctor
        </span>
      </div>

      {/* Recent Reviews */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Recent Reviews</h4>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {ratings.recentRatings.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <StarDisplay rating={review.rating} />
                  <span className="text-sm font-medium text-gray-700">
                    {review.patientName}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {review.comment && (
                <p className="text-gray-700 mb-2">{review.comment}</p>
              )}
              
              {review.wouldRecommend && (
                <div className="flex items-center space-x-1 text-green-600">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">Recommends this doctor</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorRatings;
