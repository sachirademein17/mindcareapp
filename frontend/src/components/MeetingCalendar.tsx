import { useEffect, useState } from 'react'
import axios from 'axios'
import MeetingCalendarModal from './MeetingCalendarModal'

interface Meeting {
  id: number
  patientId: number
  doctorId: number
  enrollmentId: number
  scheduledAt: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  patientNotes?: string
  doctorNotes?: string
  rejectionReason?: string
  meetingUrl?: string
  duration: number
  requestedAt: string
  approvedAt?: string
  cancelledAt?: string
  completedAt?: string
  Doctor: {
    id: number
    name: string
    email: string
    DoctorDetail?: {
      specialization: string
    }
  }
}

interface Enrollment {
  id: number
  Doctor: {
    id: number
    name: string
    DoctorDetail?: {
      specialization: string
    }
  }
}

const MeetingCalendar = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDoctorSelection, setShowDoctorSelection] = useState(true)

  useEffect(() => {
    fetchMeetings()
    fetchEnrollments()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/meetings/patient', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setMeetings(response.data.meetings)
    } catch (error) {
      console.error('Error fetching meetings:', error)
      setError('Failed to fetch meetings')
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/patient/enrollments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const enrollmentData = Array.isArray(response.data) ? response.data : []
      setEnrollments(enrollmentData.filter(e => e.status === 'approved'))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      setError('Failed to fetch enrolled doctors')
      setLoading(false)
    }
  }

  const handleDoctorSelect = (enrollment: Enrollment) => {
    setSelectedDoctor(enrollment)
    setShowCalendarModal(true)
  }

  const handleMeetingRequested = () => {
    fetchMeetings()
    setShowCalendarModal(false)
    setSelectedDoctor(null)
  }

  const handleCancelMeeting = async (meetingId: number) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return

    try {
      await axios.patch(`http://localhost:5000/api/meetings/cancel/${meetingId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchMeetings()
    } catch (error: any) {
      console.error('Error cancelling meeting:', error)
      setError(error.response?.data?.error || 'Failed to cancel meeting')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-400/30'
      case 'cancelled': return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'approved': return '✅'
      case 'rejected': return '❌'
      case 'cancelled': return '🚫'
      case 'completed': return '🏁'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading meetings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden font-inter">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold font-poppins gradient-text mb-4">
            📅 Meeting Calendar
          </h1>
          <p className="text-purple-200 text-lg">
            {showDoctorSelection ? 'Select a doctor to schedule a meeting' : 'Schedule your meeting'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-300 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Doctor Selection View */}
        {showDoctorSelection && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                👨‍⚕️ Select a Doctor to Schedule Meeting
              </h2>
              <button
                onClick={() => setShowDoctorSelection(false)}
                className="text-purple-300 hover:text-white transition-colors duration-300"
              >
                📅 View All Meetings
              </button>
            </div>

            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👨‍⚕️</div>
                <p className="text-gray-300 text-lg">No enrolled doctors found.</p>
                <p className="text-gray-400 text-sm">You need to enroll with doctors first to schedule meetings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    onClick={() => handleDoctorSelect(enrollment)}
                    className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-6 rounded-2xl border border-indigo-400/30 backdrop-blur-sm cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-indigo-300/50"
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-4">👨‍⚕️</div>
                      <h3 className="text-white font-semibold text-xl mb-2">
                        Dr. {enrollment.Doctor.name}
                      </h3>
                      <p className="text-indigo-300 text-sm mb-2">
                        📧 {enrollment.Doctor.DoctorDetail?.specialization || 'General Practice'}
                      </p>
                      <div className="mt-4 pt-4 border-t border-indigo-400/30">
                        <p className="text-gray-300 text-sm mb-2">Click to schedule meeting</p>
                        <div className="bg-purple-500/30 text-white px-4 py-2 rounded-lg text-sm">
                          📅 Book Appointment
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meeting List View */}
        {!showDoctorSelection && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                🗓️ Your Meetings
              </h2>
              <button
                onClick={() => setShowDoctorSelection(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl transition-all duration-300"
              >
                📅 Schedule New Meeting
              </button>
            </div>

          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-300 text-lg">No meetings scheduled yet.</p>
              <p className="text-gray-400 text-sm">Request a meeting with your enrolled doctors.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-6 rounded-2xl border border-indigo-400/30 backdrop-blur-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">👨‍⚕️</span>
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            Dr. {meeting.Doctor.name}
                          </h3>
                          <p className="text-indigo-300 text-sm">
                            {meeting.Doctor.DoctorDetail?.specialization || 'General Practice'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-gray-300 text-sm">📅 Scheduled:</p>
                          <p className="text-white font-medium">
                            {new Date(meeting.scheduledAt).toLocaleDateString()} at{' '}
                            {new Date(meeting.scheduledAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm">⏱️ Duration:</p>
                          <p className="text-white font-medium">{meeting.duration} minutes</p>
                        </div>
                      </div>

                      {meeting.patientNotes && (
                        <div className="mt-4">
                          <p className="text-gray-300 text-sm">📝 Your Notes:</p>
                          <p className="text-white bg-white/10 p-3 rounded-lg mt-1">
                            {meeting.patientNotes}
                          </p>
                        </div>
                      )}

                      {meeting.doctorNotes && (
                        <div className="mt-4">
                          <p className="text-gray-300 text-sm">🩺 Doctor's Notes:</p>
                          <p className="text-white bg-white/10 p-3 rounded-lg mt-1">
                            {meeting.doctorNotes}
                          </p>
                        </div>
                      )}

                      {meeting.rejectionReason && (
                        <div className="mt-4">
                          <p className="text-gray-300 text-sm">❌ Rejection Reason:</p>
                          <p className="text-red-300 bg-red-500/20 p-3 rounded-lg mt-1">
                            {meeting.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-3">
                      <div className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(meeting.status)}`}>
                        {getStatusIcon(meeting.status)} {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </div>

                      {meeting.status === 'approved' && meeting.meetingUrl && (
                        <a
                          href={meeting.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300"
                        >
                          🎥 Join Meeting
                        </a>
                      )}

                      {(meeting.status === 'pending' || meeting.status === 'approved') && (
                        <button
                          onClick={() => handleCancelMeeting(meeting.id)}
                          className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300"
                        >
                          🚫 Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Calendar Modal */}
        {showCalendarModal && selectedDoctor && (
          <MeetingCalendarModal
            selectedDoctor={selectedDoctor}
            onClose={() => {
              setShowCalendarModal(false)
              setSelectedDoctor(null)
            }}
            onMeetingRequested={handleMeetingRequested}
          />
        )}
      </div>
    </div>
  )
}

export default MeetingCalendar
