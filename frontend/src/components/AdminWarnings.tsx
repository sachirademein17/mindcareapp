import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { createApiUrl } from '../config/api'
import type { Warning } from '../types'

interface WarningStats {
  total: number
  pending: number
  under_review: number
  resolved: number
  dismissed: number
  high_severity: number
  critical_severity: number
}

const AdminWarnings: React.FC = () => {
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [stats, setStats] = useState<WarningStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{
    status: string
    severity: string
    category: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }>({
    status: 'all',
    severity: 'all',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null)
  const [updateLoading, setUpdateLoading] = useState<number | null>(null)

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' }
  ]

  const severityOptions = [
    { value: 'all', label: 'All Severity' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'unprofessional_conduct', label: 'Unprofessional Conduct' },
    { value: 'spam', label: 'Spam/Unwanted Messages' },
    { value: 'other', label: 'Other' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return '🟢'
      case 'medium': return '🟡'
      case 'high': return '🟠'
      case 'critical': return '🔴'
      default: return '⚪'
    }
  }

  useEffect(() => {
    fetchWarnings()
    fetchStats()
  }, [filter])

  const fetchWarnings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(createApiUrl('warnings/all'), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: filter.status !== 'all' ? { status: filter.status } : {}
      })
      
      // The backend now returns warnings array directly
      let filteredWarnings = response.data

      // Apply client-side filters
      if (filter.severity !== 'all') {
        filteredWarnings = filteredWarnings.filter((w: Warning) => w.severity === filter.severity)
      }
      if (filter.category !== 'all') {
        filteredWarnings = filteredWarnings.filter((w: Warning) => w.category === filter.category)
      }

      // Sort warnings
      filteredWarnings.sort((a: Warning, b: Warning) => {
        let aValue, bValue
        
        switch (filter.sortBy) {
          case 'severity':
            const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
            aValue = severityOrder[a.severity as keyof typeof severityOrder]
            bValue = severityOrder[b.severity as keyof typeof severityOrder]
            break
          case 'status':
            aValue = a.status
            bValue = b.status
            break
          case 'category':
            aValue = a.category
            bValue = b.category
            break
          default:
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
        }

        if (filter.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })

      setWarnings(filteredWarnings)
    } catch (error: any) {
      console.error('Error fetching warnings:', error)
      console.error('Error response:', error.response?.data)
      alert('❌ Failed to fetch warnings: ' + (error.response?.data?.error || error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(createApiUrl('warnings/stats'), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateWarningStatus = async (warningId: number, newStatus: string, adminNotes?: string) => {
    try {
      setUpdateLoading(warningId)
      await axios.put(createApiUrl(`warnings/${warningId}/status`), {
        status: newStatus,
        adminNotes
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      // Update local state
      setWarnings(prev => prev.map(w => 
        w.id === warningId 
          ? { ...w, status: newStatus as Warning['status'], adminNotes, updatedAt: new Date().toISOString() }
          : w
      ))

      setSelectedWarning(null)
      fetchStats()
      alert('✅ Warning status updated successfully')
    } catch (error: any) {
      console.error('Error updating warning:', error)
      alert('❌ Failed to update warning: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setUpdateLoading(null)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const StatusUpdateModal = ({ warning, onClose }: { warning: Warning, onClose: () => void }) => {
    const [newStatus, setNewStatus] = useState<Warning['status']>(warning.status)
    const [adminNotes, setAdminNotes] = useState(warning.adminNotes || '')

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-2xl">
            <h3 className="text-lg font-bold">Update Warning Status</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Warning['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about your decision..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateWarningStatus(warning.id, newStatus, adminNotes)}
                disabled={updateLoading === warning.id}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {updateLoading === warning.id ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Warning Management</h1>
        <p className="text-gray-600">Review and manage user reports and warnings</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 shadow-md border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 shadow-md border border-blue-200">
            <div className="text-2xl font-bold text-blue-800">{stats.under_review}</div>
            <div className="text-sm text-blue-600">Under Review</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 shadow-md border border-green-200">
            <div className="text-2xl font-bold text-green-800">{stats.resolved}</div>
            <div className="text-sm text-green-600">Resolved</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 shadow-md border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{stats.dismissed}</div>
            <div className="text-sm text-gray-600">Dismissed</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 shadow-md border border-orange-200">
            <div className="text-2xl font-bold text-orange-800">{stats.high_severity}</div>
            <div className="text-sm text-orange-600">High Priority</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 shadow-md border border-red-200">
            <div className="text-2xl font-bold text-red-800">{stats.critical_severity}</div>
            <div className="text-sm text-red-600">Critical</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Sorting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filter.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {severityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filter.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filter.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Date</option>
              <option value="severity">Severity</option>
              <option value="status">Status</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filter.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Warnings List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Warnings ({warnings.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading warnings...</p>
          </div>
        ) : warnings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl mb-4 block">📭</span>
            No warnings found with current filters
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {warnings.map((warning) => (
              <div key={warning.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-lg">{getSeverityIcon(warning.severity)}</span>
                      <h4 className="text-lg font-semibold text-gray-900">{warning.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(warning.status)}`}>
                        {warning.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Reporter:</span> {warning.Reporter?.name} ({warning.Reporter?.role})
                      </div>
                      <div>
                        <span className="font-medium">Reported User:</span> {warning.ReportedUser?.name} ({warning.ReportedUser?.role})
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {warning.category.replace('_', ' ')}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{warning.description}</p>

                    {warning.adminNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="font-medium text-blue-800 text-sm">Admin Notes:</div>
                        <div className="text-blue-700 text-sm">{warning.adminNotes}</div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Reported: {formatDate(warning.createdAt)}
                      {warning.updatedAt !== warning.createdAt && (
                        <span> • Updated: {formatDate(warning.updatedAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-6">
                    <button
                      onClick={() => setSelectedWarning(warning)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedWarning && (
        <StatusUpdateModal
          warning={selectedWarning}
          onClose={() => setSelectedWarning(null)}
        />
      )}
    </div>
  )
}

export default AdminWarnings
