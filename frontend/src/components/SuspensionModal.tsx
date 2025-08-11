import React, { useState } from 'react'
import axios from 'axios'
import { createApiUrl } from '../config/api'

interface SuspensionModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const SuspensionModal: React.FC<SuspensionModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const token = localStorage.getItem('token')

  const handleSuspend = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for suspension')
      return
    }

    setIsLoading(true)
    try {
      await axios.post(
        createApiUrl(`admin/users/${user.id}/suspend`),
        { reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('✅ User suspended successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error suspending user:', error)
      const errorMessage = error.response?.data?.error || 'Failed to suspend user'
      alert(`❌ ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsuspend = async () => {
    setIsLoading(true)
    try {
      await axios.post(
        createApiUrl(`admin/users/${user.id}/unsuspend`),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('✅ User unsuspended successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error unsuspending user:', error)
      const errorMessage = error.response?.data?.error || 'Failed to unsuspend user'
      alert(`❌ ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              {user.isSuspended ? '🔓' : '🔒'} {user.isSuspended ? 'Unsuspend' : 'Suspend'} User
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
              <h4 className="text-white font-medium">{user.name}</h4>
              <p className="text-gray-300 text-sm">{user.email}</p>
              <p className="text-gray-300 text-sm capitalize">Role: {user.role}</p>
              
              {user.isSuspended && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                  <p className="text-red-200 text-sm font-medium">Currently Suspended</p>
                  <p className="text-red-300 text-xs mt-1">
                    Since: {new Date(user.suspendedAt).toLocaleDateString()}
                  </p>
                  <p className="text-red-300 text-xs">
                    Reason: {user.suspendReason}
                  </p>
                </div>
              )}
            </div>

            {!user.isSuspended ? (
              <div>
                <label className="block text-white font-medium mb-2">
                  Suspension Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter the reason for suspending this user..."
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-gray-400 text-xs mt-1">{reason.length}/500 characters</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-300 mb-4">
                  Are you sure you want to unsuspend this user?
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={user.isSuspended ? handleUnsuspend : handleSuspend}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                user.isSuspended
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
              disabled={isLoading || (!user.isSuspended && !reason.trim())}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {user.isSuspended ? 'Unsuspending...' : 'Suspending...'}
                </span>
              ) : (
                user.isSuspended ? '🔓 Unsuspend User' : '🔒 Suspend User'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuspensionModal
