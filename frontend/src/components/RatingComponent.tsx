// 🌟 Rating System Component for Completed Meetings
import React, { useState } from 'react';
import { Star, Heart, MessageCircle, Award, ThumbsUp } from 'lucide-react';

interface RatingComponentProps {
  meetingId: number;
  doctorName: string;
  onRatingSubmitted: () => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ 
  meetingId, 
  doctorName, 
  onRatingSubmitted 
}) => {
  const [ratings, setRatings] = useState({
    rating: 0,
    communicationRating: 0,
    professionalismRating: 0,
    knowledgeRating: 0,
    overallSatisfaction: 0
  });
  
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const StarRating = ({ 
    value, 
    onChange, 
    label, 
    icon: Icon 
  }: { 
    value: number; 
    onChange: (rating: number) => void; 
    label: string; 
    icon?: any;
  }) => (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-5 h-5 text-blue-500" />}
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= value 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    </div>
  );

  const handleSubmitRating = async () => {
    if (ratings.rating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/meetings/${meetingId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...ratings,
          comment,
          wouldRecommend,
          isAnonymous
        })
      });

      if (response.ok) {
        alert('Rating submitted successfully!');
        onRatingSubmitted();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Rate Your Experience
        </h2>
        <p className="text-gray-600">
          How was your session with <span className="font-semibold">{doctorName}</span>?
        </p>
      </div>

      {/* Rating Categories */}
      <div className="space-y-6">
        {/* Overall Rating */}
        <StarRating
          value={ratings.rating}
          onChange={(rating) => setRatings(prev => ({ ...prev, rating }))}
          label="Overall Rating *"
          icon={Star}
        />

        {/* Detailed Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StarRating
            value={ratings.communicationRating}
            onChange={(rating) => setRatings(prev => ({ ...prev, communicationRating: rating }))}
            label="Communication Skills"
            icon={MessageCircle}
          />
          
          <StarRating
            value={ratings.professionalismRating}
            onChange={(rating) => setRatings(prev => ({ ...prev, professionalismRating: rating }))}
            label="Professionalism"
            icon={Award}
          />
          
          <StarRating
            value={ratings.knowledgeRating}
            onChange={(rating) => setRatings(prev => ({ ...prev, knowledgeRating: rating }))}
            label="Medical Knowledge"
            icon={Award}
          />
          
          <StarRating
            value={ratings.overallSatisfaction}
            onChange={(rating) => setRatings(prev => ({ ...prev, overallSatisfaction: rating }))}
            label="Overall Satisfaction"
            icon={Heart}
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your experience with this doctor..."
          />
        </div>

        {/* Recommendation */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="recommend"
            checked={wouldRecommend}
            onChange={(e) => setWouldRecommend(e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <label htmlFor="recommend" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <ThumbsUp className="w-4 h-4" />
            <span>I would recommend this doctor to others</span>
          </label>
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
            Submit this rating anonymously
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSubmitRating}
            disabled={isSubmitting || ratings.rating === 0}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
              isSubmitting || ratings.rating === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>

      {/* Rating Summary */}
      {ratings.rating > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Rating Summary:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <div>Overall: {ratings.rating}/5 ⭐</div>
            <div>Communication: {ratings.communicationRating}/5 ⭐</div>
            <div>Professionalism: {ratings.professionalismRating}/5 ⭐</div>
            <div>Knowledge: {ratings.knowledgeRating}/5 ⭐</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingComponent;
