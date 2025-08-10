// Doctor Meeting Dashboard - Updated to fix approve/reject status issue
import { useEffect, useState } from 'react'
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
  Patient: {
    id: number
    name: string
    email: string
  }
}

const DoctorMeetingDashboard = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [pendingMeetings, setPendingMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('pending')

  // Response modal state
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [responseAction, setResponseAction] = useState<'approve' | 'reject'>('approve')
  const [doctorNotes, setDoctorNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  // Jitsi Meet state
  const [showJitsiMeet, setShowJitsiMeet] = useState(false)
  const [currentMeetingUrl, setCurrentMeetingUrl] = useState('')

  useEffect(() => {
    fetchAllMeetings()
    fetchPendingMeetings()
  }, [])

  const fetchAllMeetings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/meetings/doctor', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setMeetings(response.data.meetings)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching meetings:', error)
      setError('Failed to fetch meetings')
      setLoading(false)
    }
  }

  const fetchPendingMeetings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/meetings/pending', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setPendingMeetings(response.data.meetings)
    } catch (error) {
      console.error('Error fetching pending meetings:', error)
    }
  }

  const handleRespondToMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMeeting) return

    try {
      let finalStatus: string
      if (responseAction === 'approve') {
        finalStatus = 'approved'
      } else if (responseAction === 'reject') {
        finalStatus = 'rejected'
      } else {
        console.error('Invalid responseAction:', responseAction)
        setError('Invalid response action')
        return
      }

      console.log('🩺 Sending response to meeting:', {
        meetingId: selectedMeeting.id,
        responseAction,
        finalStatus,
        doctorNotes,
        rejectionReason: responseAction === 'reject' ? rejectionReason : undefined
      })

      const requestData = {
        status: finalStatus,
        doctorNotes,
        rejectionReason: responseAction === 'reject' ? rejectionReason : undefined
      }

      console.log('📤 Final request data being sent:', requestData)

      const response = await axios.patch(`http://localhost:5000/api/meetings/respond/${selectedMeeting.id}`, requestData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      console.log('✅ Response successful:', response.data)

      setShowResponseModal(false)
      setSelectedMeeting(null)
      setDoctorNotes('')
      setRejectionReason('')
      fetchAllMeetings()
      fetchPendingMeetings()
    } catch (error: any) {
      console.error('❌ Error responding to meeting:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      setError(error.response?.data?.error || 'Failed to respond to meeting')
    }
  }

  const handleCompleteMeeting = async (meetingId: number) => {
    if (!confirm('Mark this meeting as completed?')) return

    try {
      await axios.patch(`http://localhost:5000/api/meetings/complete/${meetingId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      fetchAllMeetings()
    } catch (error: any) {
      console.error('Error completing meeting:', error)
      setError(error.response?.data?.error || 'Failed to complete meeting')
    }
  }

  const openResponseModal = (meeting: Meeting, action: 'approve' | 'reject') => {
    setSelectedMeeting(meeting)
    setResponseAction(action)
    setShowResponseModal(true)
  }

  const handleJoinMeeting = (meeting: Meeting) => {
    if (!meeting.meetingUrl) {
      setError('Meeting URL not available')
      return
    }
    
    // Extract room name from Jitsi URL
    const roomName = meeting.meetingUrl.split('/').pop() || `meeting-${meeting.id}`
    setCurrentMeetingUrl(roomName)
    setShowJitsiMeet(true)
  }

  const handleCloseMeeting = () => {
    setShowJitsiMeet(false)
    setCurrentMeetingUrl('')
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

  const displayMeetings = activeTab === 'pending' ? pendingMeetings : meetings

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
            🩺 Meeting Dashboard
          </h1>
          <p className="text-purple-200 text-lg">
            Manage patient meeting requests and appointments
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🕐 Pending Requests ({pendingMeetings.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📅 All Meetings ({meetings.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-300 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Meetings List */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            {activeTab === 'pending' ? '🕐 Pending Meeting Requests' : '📅 All Meetings'}
          </h2>

          {displayMeetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === 'pending' ? '🕐' : '📅'}
              </div>
              <p className="text-gray-300 text-lg">
                {activeTab === 'pending' ? 'No pending meeting requests.' : 'No meetings scheduled.'}
              </p>
              <p className="text-gray-400 text-sm">
                {activeTab === 'pending' 
                  ? 'New patient requests will appear here.' 
                  : 'Your scheduled meetings will appear here.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-6 rounded-2xl border border-indigo-400/30 backdrop-blur-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">👤</span>
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            {meeting.Patient.name}
                          </h3>
                          <p className="text-indigo-300 text-sm">📧 {meeting.Patient.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-300 text-sm">📅 Requested Date:</p>
                          <p className="text-white font-medium">
                            {new Date(meeting.scheduledAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm">⏰ Time:</p>
                          <p className="text-white font-medium">
                            {new Date(meeting.scheduledAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm">⏱️ Duration:</p>
                          <p className="text-white font-medium">{meeting.duration} minutes</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-gray-300 text-sm">📝 Requested:</p>
                          <p className="text-white font-medium">
                            {new Date(meeting.requestedAt).toLocaleDateString()} at{' '}
                            {new Date(meeting.requestedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(meeting.status)} w-fit`}>
                          {getStatusIcon(meeting.status)} {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                        </div>
                      </div>

                      {meeting.patientNotes && (
                        <div className="mt-4">
                          <p className="text-gray-300 text-sm">📝 Patient's Notes:</p>
                          <p className="text-white bg-white/10 p-3 rounded-lg mt-1">
                            {meeting.patientNotes}
                          </p>
                        </div>
                      )}

                      {meeting.doctorNotes && (
                        <div className="mt-4">
                          <p className="text-gray-300 text-sm">🩺 Your Notes:</p>
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

                      {meeting.meetingUrl && meeting.status === 'approved' && (
                        <div className="mt-4">
                          <p className="text-gray-300 text-sm">🎥 Meeting Link:</p>
                          <a
                            href={meeting.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline break-all"
                          >
                            {meeting.meetingUrl}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
                      {meeting.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openResponseModal(meeting, 'approve')}
                            className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => openResponseModal(meeting, 'reject')}
                            className="bg-red-500 hover:bg-red-400 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium"
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}

                      {meeting.status === 'approved' && meeting.meetingUrl && (
                        <>
                          <button
                            onClick={() => handleJoinMeeting(meeting)}
                            className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl transition-all duration-300 text-center font-medium"
                          >
                            🎥 Join Meeting
                          </button>
                          <button
                            onClick={() => handleCompleteMeeting(meeting.id)}
                            className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium"
                          >
                            🏁 Mark Complete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Response Modal */}
        {showResponseModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-purple-900 p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-white mb-6">
                {responseAction === 'approve' ? '✅ Approve Meeting' : '❌ Reject Meeting'}
              </h3>
              
              <div className="mb-4 bg-white/10 p-4 rounded-xl">
                <p className="text-gray-300 text-sm">Patient:</p>
                <p className="text-white font-semibold">{selectedMeeting.Patient.name}</p>
                <p className="text-gray-300 text-sm mt-2">Requested Time:</p>
                <p className="text-white">
                  {new Date(selectedMeeting.scheduledAt).toLocaleDateString()} at{' '}
                  {new Date(selectedMeeting.scheduledAt).toLocaleTimeString()}
                </p>
              </div>
              
              <form onSubmit={handleRespondToMeeting} className="space-y-4">
                {responseAction === 'reject' && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      ❌ Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    🩺 Your Notes (optional)
                  </label>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Any additional notes for the patient..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResponseModal(false)
                      setSelectedMeeting(null)
                      setDoctorNotes('')
                      setRejectionReason('')
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-3 rounded-xl transition-all duration-300 ${
                      responseAction === 'approve'
                        ? 'bg-green-500 hover:bg-green-400'
                        : 'bg-red-500 hover:bg-red-400'
                    } text-white`}
                  >
                    {responseAction === 'approve' ? '✅ Approve' : '❌ Reject'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Jitsi Meet Modal */}
      {showJitsiMeet && currentMeetingUrl && (
        <div className="fixed inset-0 z-50">
          <JitsiMeetComponent
            roomName={currentMeetingUrl.split('/').pop() || ''}
            displayName="Doctor"
            onClose={handleCloseMeeting}
            isDoctor={true}
          />
        </div>
      )}
    </div>
  )
}

export default DoctorMeetingDashboard
