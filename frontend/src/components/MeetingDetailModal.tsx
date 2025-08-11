import { useState } from 'react'
import axios from 'axios'
import JitsiMeetComponent from './JitsiMeetComponent'

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
  Patient?: {
    id: number
    name: string
    email: string
  }
  Doctor?: {
    id: number
    name: string
    email: string
    DoctorDetail?: {
      specialization: string
    }
  }
}

interface MeetingDetailModalProps {
  meeting: Meeting
  userRole: 'patient' | 'doctor'
  isOpen: boolean
  onClose: () => void
  onMeetingUpdated?: () => void
}

const MeetingDetailModal = ({ meeting, userRole, isOpen, onClose, onMeetingUpdated }: MeetingDetailModalProps) => {
  const [showJitsiMeet, setShowJitsiMeet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

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

  const handleCancelMeeting = async () => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return

    try {
      setLoading(true)
      setError('')
      
      await axios.patch(`http://localhost:5000/api/meetings/cancel/${meeting.id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      if (onMeetingUpdated) onMeetingUpdated()
      onClose()
    } catch (error: any) {
      console.error('Error cancelling meeting:', error)
      setError(error.response?.data?.error || 'Failed to cancel meeting')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinMeeting = () => {
    if (meeting.meetingUrl) {
      setShowJitsiMeet(true)
    }
  }

  const handleCloseMeeting = () => {
    setShowJitsiMeet(false)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const { date, time } = formatDateTime(meeting.scheduledAt)
  const endTime = new Date(new Date(meeting.scheduledAt).getTime() + (meeting.duration * 60000))
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-800 via-purple-800 to-indigo-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white flex items-center">
              🗓️ Meeting Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-300 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-400/30 text-red-300 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Participants */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">👥 Participants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">👨‍⚕️</span>
                    <div>
                      <p className="text-white font-medium">
                        Dr. {meeting.Doctor?.name || 'Unknown Doctor'}
                      </p>
                      <p className="text-purple-300 text-sm">
                        {meeting.Doctor?.DoctorDetail?.specialization || 'General Practice'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">🧠</span>
                    <div>
                      <p className="text-white font-medium">
                        {meeting.Patient?.name || 'Unknown Patient'}
                      </p>
                      <p className="text-purple-300 text-sm">Patient</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">📅 Meeting Information</h3>
              <div className="bg-white/10 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status:</span>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(meeting.status)}`}>
                    {getStatusIcon(meeting.status)} {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Date:</span>
                  <span className="text-white font-medium">{date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Time:</span>
                  <span className="text-white font-medium">{time} - {endTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Duration:</span>
                  <span className="text-white font-medium">{meeting.duration} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Requested:</span>
                  <span className="text-white font-medium">
                    {new Date(meeting.requestedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(meeting.patientNotes || meeting.doctorNotes || meeting.rejectionReason) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">📝 Notes</h3>
                <div className="space-y-3">
                  {meeting.patientNotes && (
                    <div className="bg-white/10 p-4 rounded-xl">
                      <p className="text-purple-300 text-sm mb-2">Patient Notes:</p>
                      <p className="text-white">{meeting.patientNotes}</p>
                    </div>
                  )}
                  {meeting.doctorNotes && (
                    <div className="bg-white/10 p-4 rounded-xl">
                      <p className="text-green-300 text-sm mb-2">Doctor Notes:</p>
                      <p className="text-white">{meeting.doctorNotes}</p>
                    </div>
                  )}
                  {meeting.rejectionReason && (
                    <div className="bg-red-500/20 p-4 rounded-xl border border-red-400/30">
                      <p className="text-red-300 text-sm mb-2">Rejection Reason:</p>
                      <p className="text-red-200">{meeting.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {meeting.status === 'approved' && meeting.meetingUrl && (
                <button
                  onClick={handleJoinMeeting}
                  className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center font-medium"
                >
                  🎥 Join Meeting
                </button>
              )}

              {(meeting.status === 'pending' || meeting.status === 'approved') && (
                <button
                  onClick={handleCancelMeeting}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-400 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center font-medium disabled:opacity-50"
                >
                  {loading ? '⏳ Cancelling...' : '🚫 Cancel Meeting'}
                </button>
              )}

              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-400 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center font-medium"
              >
                👈 Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Jitsi Meet Modal */}
      {showJitsiMeet && meeting.meetingUrl && (
        <div className="fixed inset-0 z-50">
          <JitsiMeetComponent
            roomName={meeting.meetingUrl.split('/').pop() || `meeting-${meeting.id}`}
            displayName={userRole === 'doctor' ? 'Doctor' : 'Patient'}
            onClose={handleCloseMeeting}
            isDoctor={userRole === 'doctor'}
          />
        </div>
      )}
    </>
  )
}

export default MeetingDetailModal
