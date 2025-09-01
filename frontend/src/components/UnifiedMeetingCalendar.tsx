// 📁 frontend/src/components/UnifiedMeetingCalendar.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

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
  }
}

interface DoctorAvailability {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface UnifiedMeetingCalendarProps {
  onMeetingSelect?: (meeting: Meeting) => void
  onAvailabilityChange?: () => void
}

const UnifiedMeetingCalendar: React.FC<UnifiedMeetingCalendarProps> = ({
  onMeetingSelect,
  onAvailabilityChange
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'meetings' | 'availability'>('meetings')
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)
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
      const response = await axios.get('http://localhost:5001/api/meetings/doctor', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setMeetings(response.data.meetings || [])
    } catch (error) {
      console.error('Error fetching meetings:', error)
    }
  }

  const fetchAvailability = async () => {
    try {
      const doctorId = JSON.parse(localStorage.getItem('user') || '{}').id
      const response = await axios.get(`http://localhost:5001/api/meetings/availability/${doctorId}`)
      setAvailability(response.data.availabilities || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching availability:', error)
      setLoading(false)
    }
  }

  const handleSetAvailability = async () => {
    try {
      await axios.post('http://localhost:5001/api/meetings/availability', newAvailability, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      setShowAvailabilityForm(false)
      setNewAvailability({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' })
      fetchAvailability()
      onAvailabilityChange?.()
      alert('✅ Availability set successfully!')
    } catch (error: any) {
      console.error('Error setting availability:', error)
      alert(`❌ ${error.response?.data?.error || 'Failed to set availability'}`)
    }
  }

  const handleDeleteAvailability = async (availabilityId: number) => {
    if (!confirm('Are you sure you want to delete this availability?')) return

    try {
      await axios.delete(`http://localhost:5001/api/meetings/availability/${availabilityId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      fetchAvailability()
      onAvailabilityChange?.()
      alert('✅ Availability deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting availability:', error)
      alert(`❌ ${error.response?.data?.error || 'Failed to delete availability'}`)
    }
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

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleDateString('en-US', {
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

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/20">
        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
            activeTab === 'meetings'
              ? 'text-white bg-white/20'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          📅 Meeting Requests ({meetings.filter(m => m.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
            activeTab === 'availability'
              ? 'text-white bg-white/20'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          ⏰ My Availability ({availability.length})
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'meetings' ? (
          // Meetings Tab
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">📋 Meeting Requests</h3>
            </div>

            {meetings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📅</div>
                <h4 className="text-lg font-semibold text-white mb-2">No Meeting Requests</h4>
                <p className="text-gray-300">Patients haven't requested any meetings yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {meetings.map(meeting => (
                  <div
                    key={meeting.id}
                    className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                    onClick={() => onMeetingSelect?.(meeting)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-white">
                            {meeting.Patient?.name || `Patient #${meeting.patientId}`}
                          </h4>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-1">
                          📅 {formatDateTime(meeting.scheduledAt)}
                        </p>
                        <p className="text-gray-300 text-sm">
                          ⏱️ Duration: {meeting.duration} hour(s)
                        </p>
                        {meeting.patientNotes && (
                          <p className="text-gray-300 text-sm mt-2">
                            💬 "{meeting.patientNotes}"
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {meeting.status === 'pending' && (
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-500 hover:bg-green-400 text-white rounded-lg text-sm transition-colors">
                              ✓ Approve
                            </button>
                            <button className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm transition-colors">
                              ✗ Decline
                            </button>
                          </div>
                        )}
                        {meeting.status === 'approved' && meeting.meetingUrl && (
                          <a
                            href={meeting.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm transition-colors text-center"
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
        ) : (
          // Availability Tab
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">⏰ My Availability</h3>
              <button
                onClick={() => setShowAvailabilityForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all duration-300 font-medium"
              >
                ➕ Add Availability
              </button>
            </div>

            {availability.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⏰</div>
                <h4 className="text-lg font-semibold text-white mb-2">No Availability Set</h4>
                <p className="text-gray-300">Set your availability so patients can book meetings with you.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availability.map(avail => (
                  <div
                    key={avail.id}
                    className="bg-white/10 rounded-xl p-4 border border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          {dayNames[avail.dayOfWeek]}
                        </h4>
                        <p className="text-gray-300 text-sm">
                          {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`w-2 h-2 rounded-full mr-2 ${avail.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                          <span className="text-xs text-gray-300">
                            {avail.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAvailability(avail.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Availability Form */}
            {showAvailabilityForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">➕ Add Availability</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                      <select
                        value={newAvailability.dayOfWeek}
                        onChange={(e) => setNewAvailability(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={newAvailability.endTime}
                        onChange={(e) => setNewAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAvailabilityForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSetAvailability}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                      Add Availability
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UnifiedMeetingCalendar

