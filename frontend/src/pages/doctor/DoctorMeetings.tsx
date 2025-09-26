// 📁 frontend/src/pages/doctor/DoctorMeetings.tsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import MeetingDetailModal from '../../components/MeetingDetailModal'

interface Meeting {
  id: number
  patientId: number
  doctorId: number
  enrollmentId: number
  meetingDate: string
  startTime: string
  endTime: string
  scheduledAt: string // For compatibility with MeetingDetailModal
  duration: number // For compatibility with MeetingDetailModal
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  patientNotes?: string
  doctorNotes?: string
  declineReason?: string
  rejectionReason?: string // For compatibility with MeetingDetailModal
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

interface DoctorAvailability {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const DoctorMeetings: React.FC = () => {
  const location = useLocation()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [loading, setLoading] = useState(true)
  // Set default tab based on route - if coming from /doctor/availability, show availability tab
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'completed' | 'availability'>(
    location.pathname === '/doctor/availability' ? 'availability' : 'pending'
  )
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)
  const [showEditAvailabilityForm, setShowEditAvailabilityForm] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<DoctorAvailability | null>(null)
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00'
  })

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useEffect(() => {
    fetchMeetings()
    fetchAvailability()
  }, [])

  const fetchMeetings = async () => {
    try {
      // Get user data from localStorage with better error handling
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      console.log('🔍 User data check:', { userData: !!userData, token: !!token })
      
      if (!token) {
        console.error('❌ No authentication token found')
        return
      }
      
      const response = await axios.get('http://localhost:5000/api/meetings/doctor', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Map the data to include compatibility fields
      const mappedMeetings = (response.data.meetings || []).map((meeting: any) => ({
        ...meeting,
        scheduledAt: `${meeting.meetingDate}T${meeting.startTime}:00`, // Combine date and time
        duration: 1, // Default 1 hour duration
        rejectionReason: meeting.declineReason // Map declineReason to rejectionReason for modal compatibility
      }))
      
      setMeetings(mappedMeetings)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching meetings:', error)
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    try {
      // Get user ID from localStorage (stored as 'userId' during login)
      const doctorId = localStorage.getItem('userId')
      console.log('🔍 Raw doctorId from localStorage (userId):', doctorId)
      
      if (!doctorId) {
        console.error('❌ No doctor ID found in localStorage')
        return
      }
      
      console.log('🔍 Fetching availability for doctor ID:', doctorId)
      const response = await axios.get(`http://localhost:5000/api/meetings/availability/${doctorId}`)
      console.log('📊 Availability API response:', response.data)
      setAvailability(response.data.availabilities || [])
      console.log('✅ Availability state updated:', response.data.availabilities || [])
    } catch (error: any) {
      console.error('❌ Error fetching availability:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
    }
  }

  const handleSetAvailability = async () => {
    try {
      console.log('📝 Setting availability with data:', newAvailability)
      const response = await axios.post('http://localhost:5000/api/meetings/availability', newAvailability, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      console.log('✅ Set availability response:', response.data)
      
      setShowAvailabilityForm(false)
      setNewAvailability({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' })
      await fetchAvailability() // Ensure we wait for the fetch to complete
      alert('✅ Availability set successfully!')
    } catch (error: any) {
      console.error('❌ Error setting availability:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
      alert(`❌ ${error.response?.data?.error || 'Failed to set availability'}`)
    }
  }

  const handleDeleteAvailability = async (availabilityId: number) => {
    if (!confirm('Are you sure you want to delete this availability?')) return

    try {
      console.log('🗑️ Deleting availability with ID:', availabilityId)
      const response = await axios.delete(`http://localhost:5000/api/meetings/availability/${availabilityId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      console.log('✅ Delete availability response:', response.data)
      
      fetchAvailability()
      alert('✅ Availability deleted successfully!')
    } catch (error: any) {
      console.error('❌ Error deleting availability:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
      alert(`❌ ${error.response?.data?.error || 'Failed to delete availability'}`)
    }
  }

  const handleEditAvailability = (availability: DoctorAvailability) => {
    setEditingAvailability(availability)
    setNewAvailability({
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime
    })
    setShowEditAvailabilityForm(true)
  }

  const handleUpdateAvailability = async () => {
    if (!editingAvailability) return
    
    try {
      console.log('✏️ Updating availability with ID:', editingAvailability.id)
      console.log('📝 Update data:', {
        dayOfWeek: newAvailability.dayOfWeek,
        startTime: newAvailability.startTime,
        endTime: newAvailability.endTime,
        isActive: true
      })
      
      const response = await axios.put(`http://localhost:5000/api/meetings/availability/${editingAvailability.id}`, {
        dayOfWeek: newAvailability.dayOfWeek,
        startTime: newAvailability.startTime,
        endTime: newAvailability.endTime,
        isActive: true
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      console.log('✅ Update availability response:', response.data)
      
      setShowEditAvailabilityForm(false)
      setEditingAvailability(null)
      setNewAvailability({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' })
      await fetchAvailability() // Refresh the list
      alert('✅ Availability updated successfully!')
    } catch (error: any) {
      console.error('❌ Error updating availability:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
      alert(`❌ ${error.response?.data?.error || 'Failed to update availability'}`)
    }
  }

  const handleMeetingSelect = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setShowMeetingModal(true)
  }

  const handleMeetingUpdate = () => {
    fetchMeetings()
    setShowMeetingModal(false)
    setSelectedMeeting(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
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

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':')
    const hourNum = parseInt(hour)
    const ampm = hourNum >= 12 ? 'PM' : 'AM'
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
    return `${displayHour}:${minute} ${ampm}`
  }

  const getFilteredMeetings = () => {
    switch (activeTab) {
      case 'pending':
        return meetings.filter(m => m.status === 'pending')
      case 'approved':
        return meetings.filter(m => m.status === 'approved')
      case 'completed':
        return meetings.filter(m => m.status === 'completed')
      default:
        return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading meetings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">📅</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">👨‍⚕️</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">🎥</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">💼</div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <Link 
            to="/doctor/dashboard" 
            className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-300 mb-4 group"
          >
            <span className="mr-2 group-hover:translate-x-[-4px] transition-transform duration-300">←</span>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Meeting Management
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in animation-delay-1000">
            📅 Manage your patient meetings and availability schedule
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-8">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'text-white bg-white/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🕐 Pending ({meetings.filter(m => m.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'approved'
                  ? 'text-white bg-white/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              ✅ Approved ({meetings.filter(m => m.status === 'approved').length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'text-white bg-white/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🏁 Completed ({meetings.filter(m => m.status === 'completed').length})
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'availability'
                  ? 'text-white bg-white/20'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              ⏰ Availability ({availability.length})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          {activeTab === 'availability' ? (
            // Availability Management
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">⏰ My Availability Schedule</h3>
                <button
                  onClick={() => setShowAvailabilityForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all duration-300 font-medium shadow-lg"
                >
                  ➕ Add Time Slot
                </button>
              </div>

              {/* Debug info */}
              <div className="mb-4 p-4 bg-blue-900/30 rounded-lg">
                <p className="text-white text-sm">
                  🔍 Debug: Availability array length: {availability.length}
                </p>
                <p className="text-white text-xs mt-1">
                  Data: {JSON.stringify(availability, null, 2)}
                </p>
              </div>

              {availability.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⏰</div>
                  <h4 className="text-xl font-semibold text-white mb-2">No Availability Set</h4>
                  <p className="text-gray-300 mb-6">Set your availability so patients can book meetings with you.</p>
                  <button
                    onClick={() => setShowAvailabilityForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all duration-300 font-medium"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availability.map(avail => (
                    <div
                      key={avail.id}
                      className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-white text-lg">
                          {dayNames[avail.dayOfWeek]}
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAvailability(avail)}
                            className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-500/20 rounded-lg"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteAvailability(avail.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/20 rounded-lg"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-300">
                          <span className="font-medium">Time:</span> {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
                        </p>
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${avail.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                          <span className="text-sm text-gray-300">
                            {avail.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Meetings List
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                {activeTab === 'pending' && '🕐 Pending Meeting Requests'}
                {activeTab === 'approved' && '✅ Approved Meetings'}
                {activeTab === 'completed' && '🏁 Completed Meetings'}
              </h3>

              {getFilteredMeetings().length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">
                    {activeTab === 'pending' && '🕐'}
                    {activeTab === 'approved' && '✅'}
                    {activeTab === 'completed' && '🏁'}
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">
                    {activeTab === 'pending' && 'No Pending Requests'}
                    {activeTab === 'approved' && 'No Approved Meetings'}
                    {activeTab === 'completed' && 'No Completed Meetings'}
                  </h4>
                  <p className="text-gray-300">
                    {activeTab === 'pending' && 'New meeting requests will appear here.'}
                    {activeTab === 'approved' && 'Approved meetings will appear here.'}
                    {activeTab === 'completed' && 'Completed meetings will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredMeetings().map(meeting => (
                    <div
                      key={meeting.id}
                      className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                      onClick={() => handleMeetingSelect(meeting)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg mb-2">
                            {meeting.Patient?.name || `Patient #${meeting.patientId}`}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(meeting.status)}`}>
                              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                            </span>
                            <div className="text-green-300 text-sm">
                              <span className="font-medium">${meeting.consultationFee}</span>
                              <span className="text-xs text-gray-400 ml-1">
                                (You earn: ${(meeting.consultationFee * 0.85).toFixed(2)})
                              </span>
                            </div>
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
                            💬 "{meeting.patientNotes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Requested: {new Date(meeting.requestedAt).toLocaleDateString()}
                        </span>
                        {meeting.status === 'approved' && meeting.meetingUrl && (
                          <a
                            href={meeting.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🎥 Join Meeting
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Availability Modal */}
      {showAvailabilityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">➕ Add Availability</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                <select
                  value={newAvailability.dayOfWeek}
                  onChange={(e) => setNewAvailability(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={newAvailability.startTime}
                  onChange={(e) => setNewAvailability(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={newAvailability.endTime}
                  onChange={(e) => setNewAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowAvailabilityForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetAvailability}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all duration-300 font-medium"
              >
                Add Availability
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Availability Modal */}
      {showEditAvailabilityForm && editingAvailability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Availability</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                <select
                  value={editingAvailability.dayOfWeek}
                  onChange={(e) => setEditingAvailability(prev => prev ? { ...prev, dayOfWeek: parseInt(e.target.value) } : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={editingAvailability.startTime}
                  onChange={(e) => setEditingAvailability(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={editingAvailability.endTime}
                  onChange={(e) => setEditingAvailability(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editingAvailability.isActive}
                  onChange={(e) => setEditingAvailability(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowEditAvailabilityForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAvailability}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-400 hover:to-blue-500 transition-all duration-300 font-medium"
              >
                Update Availability
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {showMeetingModal && selectedMeeting && (
        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setShowMeetingModal(false)}
          onUpdate={handleMeetingUpdate}
        />
      )}
    </div>
  )
}

export default DoctorMeetings

