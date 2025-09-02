// 🌟 Pending Ratings Component - Shows meetings that need rating
import React, { useState, useEffect } from 'react';
import { Star, Clock, Calendar, User } from 'lucide-react';
import RatingComponent from './RatingComponent';

interface PendingRating {
  meetingId: number;
  doctorName: string;
  doctorId: number;
  meetingDate: string;
  completedAt: string;
  consultationFee: number;
}

const PendingRatings: React.FC = () => {
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<PendingRating | null>(null);

  useEffect(() => {
    fetchPendingRatings();
  }, []);

  const fetchPendingRatings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ratings/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingRatings(data.pendingRatings);
      } else {
        setError('Failed to load pending ratings');
      }
    } catch (err) {
      setError('Error loading pending ratings');
      console.error('Error fetching pending ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmitted = () => {
    setSelectedMeeting(null);
    fetchPendingRatings(); // Refresh the list
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  // Show rating form if a meeting is selected
  if (selectedMeeting) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMeeting(null)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to pending ratings
          </button>
        </div>
        
        <RatingComponent
          meetingId={selectedMeeting.meetingId}
          doctorName={selectedMeeting.doctorName}
          onRatingSubmitted={handleRatingSubmitted}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Star className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Rate Your Recent Sessions</h2>
        </div>
        <p className="text-gray-600">
          Help other patients by sharing your experience with these doctors
        </p>
      </div>

      {/* Pending Ratings List */}
      {pendingRatings.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">All caught up!</h3>
          <p className="text-gray-500">
            You don't have any completed sessions that need rating.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingRatings.map((meeting) => (
            <div
              key={meeting.meetingId}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Doctor Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Dr. {meeting.doctorName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Consultation Fee: ${meeting.consultationFee}
                      </p>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Session Date: {formatDate(meeting.meetingDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        Completed: {formatDateTime(meeting.completedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Your feedback matters!</strong> Help other patients by rating this session.
                    </p>
                  </div>
                </div>

                {/* Rate Button */}
                <div className="ml-4">
                  <button
                    onClick={() => setSelectedMeeting(meeting)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Star className="w-4 h-4" />
                    <span>Rate Session</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Note */}
      {pendingRatings.length > 0 && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Privacy Note:</strong> You can choose to submit ratings anonymously. 
            Your honest feedback helps improve the quality of care for all patients.
          </p>
        </div>
      )}
    </div>
  );
};

export default PendingRatings;
