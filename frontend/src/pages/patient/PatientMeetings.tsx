// 📁 frontend/src/pages/patient/PatientMeetings.tsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import TimeSlotPicker from '../../components/TimeSlotPicker'

interface Meeting {
  id: number
  patientId: number
  doctorId: number
  enrollmentId: number
  meetingDate: string
  startTime: string
  endTime: string
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled'
  patientNotes?: string
  doctorNotes?: string
  declineReason?: string
  meetingUrl?: string
  consultationFee: number
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'withdrawn'
  paymentId?: string
  paymentIntentId?: string
  canRefund: boolean
  refundDeadline?: string
  rating?: number
  ratingComment?: string
  requestedAt: string
  approvedAt?: string
  declinedAt?: string
  completedAt?: string
  cancelledAt?: string
  Patient?: {
    id: number
    name: string
    email: string
  }
  Doctor?: {
    id: number
    name: string
    email: string
  }
}

interface Doctor {
  id: number
  name: string
  email: string
  DoctorDetail?: {
    specialization: string
    experience: number
    location: string
    languages: string
    consultationFee: number
    bio: string
  }
}

interface Enrollment {
  id: number
  doctorId: number
  patientId: number
  status: string
  Doctor?: Doctor
}

const PatientMeetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'book'>('upcoming')
  const [showTimeSlotPicker, setShowTimeSlotPicker] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [ratingModal, setRatingModal] = useState<{show: boolean, meeting: Meeting | null}>({show: false, meeting: null})
  const [rating, setRating] = useState(5)
  const [ratingComment, setRatingComment] = useState('')

  useEffect(() => {
    fetchMeetings()
    fetchEnrollments()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/meetings/patient', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setMeetings(response.data.meetings || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching meetings:', error)
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/patient/enrollments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setEnrollments(response.data || [])
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

  const handleBookMeeting = (enrollment: Enrollment) => {
    setSelectedDoctor(enrollment.Doctor || null)
    setSelectedEnrollment(enrollment)
    setShowTimeSlotPicker(true)
  }

  const handleSlotSelected = async (meetingId: number, dateTime: string) => {
    alert('🎉 Meeting booked successfully! The doctor will review and approve your request.')
    setShowTimeSlotPicker(false)
    setSelectedDoctor(null)
    setSelectedEnrollment(null)
    fetchMeetings() // Refresh meetings list
  }

  const handleCancelTimeSlotPicker = () => {
    setShowTimeSlotPicker(false)
    setSelectedDoctor(null)
    setSelectedEnrollment(null)
  }

  const handleCancelMeeting = async (meetingId: number) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return

    try {
      await axios.put(`http://localhost:5000/api/meetings/${meetingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      alert('✅ Meeting cancelled successfully!')
      fetchMeetings()
    } catch (error: any) {
      console.error('Error cancelling meeting:', error)
      alert(`❌ ${error.response?.data?.error || 'Failed to cancel meeting'}`)
    }
  }

  const handleRateMeeting = async () => {
    if (!ratingModal.meeting) return

    try {
      await axios.put(`http://localhost:5000/api/meetings/${ratingModal.meeting.id}/rate`, {
        rating,
        ratingComment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      alert('✅ Rating submitted successfully!')
      setRatingModal({show: false, meeting: null})
      setRating(5)
      setRatingComment('')
      fetchMeetings()
    } catch (error: any) {
      console.error('Error rating meeting:', error)
      alert(`❌ ${error.response?.data?.error || 'Failed to submit rating'}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'declined': return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}:00`)
    return dateTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUpcomingMeetings = () => {
    const now = new Date()
    return meetings.filter(m => {
      const meetingDateTime = new Date(`${m.meetingDate}T${m.startTime}:00`)
      return meetingDateTime > now && (m.status === 'pending' || m.status === 'approved')
    })
  }

  const getPastMeetings = () => {
    const now = new Date()
    return meetings.filter(m => {
      const meetingDateTime = new Date(`${m.meetingDate}T${m.startTime}:00`)
      return meetingDateTime <= now || m.status === 'completed' || m.status === 'declined' || m.status === 'cancelled'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading meetings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">📅</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">👩‍⚕️</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">🎥</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">💊</div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <Link 
            to="/patient/dashboard" 
            className="inline-flex items-center text-purple-300 hover:text-purple-200 transition-colors duration-300 mb-4 group"
          >
            <span className="mr-2 group-hover:translate-x-[-4px] transition-transform duration-300">←</span>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
            My Meetings
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in animation-delay-1000">
            📅 Book appointments and manage your mental health sessions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'text-white bg-white/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🔮 Upcoming ({getUpcomingMeetings().length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'past'
                  ? 'text-white bg-white/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              📜 Past Meetings ({getPastMeetings().length})
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'book'
                  ? 'text-white bg-white/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              ➕ Book New Meeting ({enrollments.length} doctors available)
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          {activeTab === 'upcoming' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">🔮 Upcoming Meetings</h3>
              
              {getUpcomingMeetings().length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h4 className="text-xl font-semibold text-white mb-2">No Upcoming Meetings</h4>
                  <p className="text-gray-300 mb-6">Book a meeting with your enrolled doctors to get started.</p>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-400 hover:to-blue-500 transition-all duration-300 font-medium"
                  >
                    Book Your First Meeting
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getUpcomingMeetings().map(meeting => (
                    <div
                      key={meeting.id}
                      className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg mb-2">
                            Dr. {meeting.Doctor?.name || `Doctor #${meeting.doctorId}`}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(meeting.status)}`}>
                              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                            </span>
                            <span className="text-green-300 text-sm font-medium">
                              ${meeting.consultationFee}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-gray-300 text-sm">
                          📅 {formatDateTime(meeting.meetingDate, meeting.startTime)}
                        </p>
                        <p className="text-gray-300 text-sm">
                          ⏱️ Duration: 1 hour ({meeting.startTime} - {meeting.endTime})
                        </p>
                        {meeting.patientNotes && (
                          <p className="text-gray-300 text-sm">
                            💬 Your notes: "{meeting.patientNotes}"
                          </p>
                        )}
                        {meeting.doctorNotes && (
                          <p className="text-gray-300 text-sm">
                            👨‍⚕️ Doctor's notes: "{meeting.doctorNotes}"
                          </p>
                        )}
                        {meeting.status === 'declined' && meeting.declineReason && (
                          <p className="text-red-300 text-sm">
                            ❌ Declined: "{meeting.declineReason}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Requested: {new Date(meeting.requestedAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          {meeting.status === 'pending' && (
                            <button
                              onClick={() => handleCancelMeeting(meeting.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          {meeting.status === 'approved' && meeting.meetingUrl && (
                            <a
                              href={meeting.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm transition-colors"
                            >
                              🎥 Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">📜 Past Meetings</h3>
              
              {getPastMeetings().length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📜</div>
                  <h4 className="text-xl font-semibold text-white mb-2">No Past Meetings</h4>
                  <p className="text-gray-300">Your completed meetings will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getPastMeetings().map(meeting => (
                    <div
                      key={meeting.id}
                      className="bg-white/10 rounded-2xl p-6 border border-white/20"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg mb-2">
                            Dr. {meeting.Doctor?.name || `Doctor #${meeting.doctorId}`}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(meeting.status)}`}>
                              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                            </span>
                            <span className="text-green-300 text-sm font-medium">
                              ${meeting.consultationFee}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-gray-300 text-sm">
                          📅 {formatDateTime(meeting.meetingDate, meeting.startTime)}
                        </p>
                        {meeting.doctorNotes && (
                          <p className="text-gray-300 text-sm">
                            👨‍⚕️ Doctor's notes: "{meeting.doctorNotes}"
                          </p>
                        )}
                        {meeting.status === 'declined' && meeting.declineReason && (
                          <p className="text-red-300 text-sm">
                            ❌ Declined: "{meeting.declineReason}"
                          </p>
                        )}
                        {meeting.rating && (
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">
                              {'★'.repeat(meeting.rating)}{'☆'.repeat(5 - meeting.rating)}
                            </span>
                            {meeting.ratingComment && (
                              <span className="text-gray-300 text-sm">"{meeting.ratingComment}"</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {meeting.completedAt && `Completed: ${new Date(meeting.completedAt).toLocaleDateString()}`}
                          {meeting.cancelledAt && `Cancelled: ${new Date(meeting.cancelledAt).toLocaleDateString()}`}
                          {meeting.declinedAt && `Declined: ${new Date(meeting.declinedAt).toLocaleDateString()}`}
                        </span>
                        {meeting.status === 'completed' && !meeting.rating && (
                          <button
                            onClick={() => setRatingModal({show: true, meeting})}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-white rounded-lg text-sm transition-colors"
                          >
                            ⭐ Rate Meeting
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'book' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">➕ Book New Meeting</h3>
              
              {enrollments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👨‍⚕️</div>
                  <h4 className="text-xl font-semibold text-white mb-2">No Enrolled Doctors</h4>
                  <p className="text-gray-300 mb-6">You need to enroll with doctors first before booking meetings.</p>
                  <Link
                    to="/patient/find-doctors"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-400 hover:to-blue-500 transition-all duration-300 font-medium"
                  >
                    Find Doctors
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {enrollments.map(enrollment => (
                    <div
                      key={enrollment.id}
                      className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg mb-2">
                            Dr. {enrollment.Doctor?.name || `Doctor #${enrollment.doctorId}`}
                          </h4>
                          {enrollment.Doctor?.DoctorDetail && (
                            <div className="space-y-1 mb-3">
                              <p className="text-gray-300 text-sm">
                                🏥 {enrollment.Doctor.DoctorDetail.specialization}
                              </p>
                              <p className="text-gray-300 text-sm">
                                📍 {enrollment.Doctor.DoctorDetail.location}
                              </p>
                              <p className="text-green-300 text-sm font-medium">
                                💰 ${enrollment.Doctor.DoctorDetail.consultationFee}/hour
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {enrollment.Doctor?.DoctorDetail?.bio && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {enrollment.Doctor.DoctorDetail.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {enrollment.Doctor?.DoctorDetail?.experience} years experience
                        </span>
                        <button
                          onClick={() => handleBookMeeting(enrollment)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all duration-300 font-medium"
                        >
                          📅 Book Meeting
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TimeSlot Picker Modal */}
      {showTimeSlotPicker && selectedDoctor && selectedEnrollment && (
        <TimeSlotPicker
          doctorId={selectedDoctor.id}
          enrollmentId={selectedEnrollment.id}
          onSlotSelected={handleSlotSelected}
          onCancel={handleCancelTimeSlotPicker}
        />
      )}

      {/* Rating Modal */}
      {ratingModal.show && ratingModal.meeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">⭐ Rate Your Meeting</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setRatingModal({show: false, meeting: null})}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRateMeeting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 font-medium"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientMeetings
