import React, { useState } from 'react'
import axios from 'axios'
import { createApiUrl } from '../config/api'

interface ReportUserModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUser: {
    id: number
    name: string
    role: 'patient' | 'doctor'
  }
  onReportSubmitted?: () => void
}

const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  reportedUser,
  onReportSubmitted
}) => {
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    severity: 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const categories = [
    { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'unprofessional_conduct', label: 'Unprofessional Conduct' },
    { value: 'spam', label: 'Spam/Unwanted Messages' },
    { value: 'other', label: 'Other' }
  ]

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.category) newErrors.category = 'Please select a category'
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (formData.title.length > 100) newErrors.title = 'Title must be less than 100 characters'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.description.length < 20) newErrors.description = 'Please provide more details (minimum 20 characters)'
    if (formData.description.length > 1000) newErrors.description = 'Description must be less than 1000 characters'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await axios.post(createApiUrl('warnings/submit'), {
        reportedUserId: reportedUser.id,
        reportedUserType: reportedUser.role,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        severity: formData.severity
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      alert('🚨 Report submitted successfully. Our admin team will review it.')
      
      // Reset form
      setFormData({
        category: '',
        title: '',
        description: '',
        severity: 'medium'
      })
      
      onReportSubmitted?.()
      onClose()
    } catch (error: any) {
      console.error('Error submitting report:', error)
      alert('❌ Failed to submit report: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        category: '',
        title: '',
        description: '',
        severity: 'medium'
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <span className="mr-3">🚨</span>
                Report User
              </h2>
              <p className="text-red-100 mt-1">
                Report inappropriate behavior by {reportedUser.name} ({reportedUser.role})
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-white hover:text-red-200 transition-colors duration-200 text-2xl disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief description of the issue"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              required
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title ? (
                <p className="text-red-500 text-sm">{errors.title}</p>
              ) : (
                <span></span>
              )}
              <span className="text-gray-400 text-sm">{formData.title.length}/100</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please provide detailed information about the inappropriate behavior, including when it occurred and any relevant context."
              rows={5}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-vertical"
              required
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <p className="text-red-500 text-sm">{errors.description}</p>
              ) : (
                <span></span>
              )}
              <span className="text-gray-400 text-sm">{formData.description.length}/1000</span>
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {severityLevels.map(level => (
                <label
                  key={level.value}
                  className={`relative flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.severity === level.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={formData.severity === level.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className={`font-medium ${formData.severity === level.value ? 'text-red-700' : level.color}`}>
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start">
              <span className="text-yellow-500 text-xl mr-3">⚠️</span>
              <div>
                <h4 className="text-yellow-800 font-semibold text-sm">Important Notice</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  False reports or misuse of this system may result in action against your account. 
                  Please only report genuine concerns about inappropriate behavior.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="mr-2">🚨</span>
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportUserModal
