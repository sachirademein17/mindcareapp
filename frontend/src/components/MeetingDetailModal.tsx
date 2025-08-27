// 📁 frontend/src/components/MeetingDetailModal.tsx
import React, { useState } from 'react'
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

interface MeetingDetailModalProps {
  meeting: Meeting
  onClose: () => void
  onUpdate: () => void
}

const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  meeting,
  onClose,
  onUpdate
}) => {
  const [doctorNotes, setDoctorNotes] = useState(meeting.doctorNotes || '')
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      await axios.put(`http://localhost:5000/api/meetings/${meeting.id}/approve`, 
        { doctorNotes },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      
      alert('✅ Meeting approved successfully!')
      onUpdate()
      onClose()
    } catch (error: any) {
      console.error('Error approving meeting:', error)
      alert(`❌ ${error.response?.data?.error || 'Failed to approve meeting'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for declining the meeting.')
      return
    }

    setLoading(true)
    try {
      await axios.put(`http://localhost:5000/api/meetings/${meeting.id}/decline`, 
        { rejectionReason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      
      alert('✅ Meeting declined successfully!')
      onUpdate()
      onClose()
    } catch (error: any) {
      console.error('Error declining meeting:', error)
      alert(`❌ ${error.response?.data?.error || 'Failed to decline meeting'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return

    setLoading(true)
    try {
      await axios.put(`http://localhost:5000/api/meetings/${meeting.id}/cancel`, {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      
      alert('✅ Meeting cancelled successfully!')
      onUpdate()
      onClose()
    } catch (error: any) {
      console.error('Error cancelling meeting:', error)
      alert(`❌ ${error.response?.data?.error || 'Failed to cancel meeting'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await axios.put(`http://localhost:5000/api/meetings/${meeting.id}/complete`, 
        { doctorNotes },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      
      alert('✅ Meeting marked as completed!')
      onUpdate()
      onClose()
    } catch (error: any) {
      console.error('Error completing meeting:', error)
      alert(`❌ ${error.response?.data?.error || 'Failed to complete meeting'}`)
    } finally {
      setLoading(false)
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">📅 Meeting Details</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(meeting.status)}`}>
                  {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                </span>
                <span className="text-blue-100">ID: #{meeting.id}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Patient Information */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-3">👤 Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{meeting.Patient?.name || `Patient #${meeting.patientId}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{meeting.Patient?.email || 'Not available'}</p>
              </div>
            </div>
          </div>

          {/* Meeting Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-3">📅 Meeting Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Scheduled Date & Time</p>
                <p className="font-medium">{formatDateTime(meeting.scheduledAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{meeting.duration} hour(s)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Requested At</p>
                <p className="font-medium">{formatDateTime(meeting.requestedAt)}</p>
              </div>
              {meeting.approvedAt && (
                <div>
                  <p className="text-sm text-gray-600">Approved At</p>
                  <p className="font-medium">{formatDateTime(meeting.approvedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Patient Notes */}
          {meeting.patientNotes && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">💬 Patient Notes</h3>
              <p className="text-gray-600 italic">"{meeting.patientNotes}"</p>
            </div>
          )}

          {/* Doctor Notes */}
          <div className="mb-6 p-4 bg-green-50 rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-3">📝 Doctor Notes</h3>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Add your notes about this meeting..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Rejection Reason (if declining) */}
          {meeting.status === 'pending' && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-3">❌ Rejection Reason</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="If declining, please provide a reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
          )}

          {/* Rejection Reason Display */}
          {meeting.status === 'rejected' && meeting.rejectionReason && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">❌ Rejection Reason</h3>
              <p className="text-red-600 italic">"{meeting.rejectionReason}"</p>
            </div>
          )}

          {/* Meeting URL */}
          {meeting.status === 'approved' && meeting.meetingUrl && (
            <div className="mb-6 p-4 bg-purple-50 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-3">🎥 Meeting Link</h3>
              <div className="flex items-center gap-3">
                <a
                  href={meeting.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors text-center font-medium"
                >
                  🎥 Join Video Meeting
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(meeting.meetingUrl || '')}
                  className="px-3 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  📋 Copy Link
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close
            </button>

            {meeting.status === 'pending' && (
              <>
                <button
                  onClick={handleDecline}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-400 disabled:bg-red-300 transition-colors font-medium"
                >
                  {loading ? '⏳ Declining...' : '❌ Decline'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-400 disabled:bg-green-300 transition-colors font-medium"
                >
                  {loading ? '⏳ Approving...' : '✅ Approve'}
                </button>
              </>
            )}

            {meeting.status === 'approved' && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-400 disabled:bg-orange-300 transition-colors font-medium"
                >
                  {loading ? '⏳ Cancelling...' : '🚫 Cancel Meeting'}
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-400 disabled:bg-blue-300 transition-colors font-medium"
                >
                  {loading ? '⏳ Completing...' : '✅ Mark Complete'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingDetailModal
