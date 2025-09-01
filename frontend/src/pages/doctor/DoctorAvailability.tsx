// 📁 frontend/src/pages/doctor/DoctorAvailability.tsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

interface DoctorAvailability {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const DoctorAvailability: React.FC = () => {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<DoctorAvailability | null>(null)
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00'
  })

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      const doctorId = localStorage.getItem('userId')
      if (!doctorId) {
        console.error('No doctor ID found')
        return
      }

      const response = await axios.get(`http://localhost:5000/api/meetings/availability/${doctorId}`)
      setAvailability(response.data.availabilities || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching availability:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingAvailability) {
        // Update existing availability
        await axios.put(`http://localhost:5000/api/meetings/availability/${editingAvailability.id}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        alert('✅ Availability updated successfully!')
      } else {
        // Create new availability
        await axios.post('http://localhost:5000/api/meetings/availability', formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        alert('✅ Availability added successfully!')
      }
      
      setShowForm(false)
      setEditingAvailability(null)
      setFormData({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' })
      fetchAvailability()
    } catch (error: any) {
      console.error('Error saving availability:', error)
      alert(`❌ ${error.response?.data?.error || 'Failed to save availability'}`)
    }
  }

  const handleEdit = (avail: DoctorAvailability) => {
    setEditingAvailability(avail)
    setFormData({
      dayOfWeek: avail.dayOfWeek,
      startTime: avail.startTime,
      endTime: avail.endTime
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this availability?')) return

    try {
      await axios.delete(`http://localhost:5000/api/meetings/availability/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('✅ Availability deleted successfully!')
      fetchAvailability()
    } catch (error: any) {
      console.error('Error deleting availability:', error)
      alert(`❌ ${error.response?.data?.error || 'Failed to delete availability'}`)
    }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading availability...</p>
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
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">⏰</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">📅</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">🕐</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">⏱️</div>
      </div>

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
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
            Doctor Availability
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in animation-delay-1000">
            ⏰ Set your available times for patient consultations
          </p>
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => {
              setEditingAvailability(null)
              setFormData({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' })
              setShowForm(true)
            }}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all duration-300 font-medium shadow-lg transform hover:scale-105"
          >
            ➕ Add New Time Slot
          </button>
        </div>

        {/* Availability List */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6">⏰ Current Schedule</h3>

          {availability.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h4 className="text-xl font-semibold text-white mb-2">No Availability Set</h4>
              <p className="text-gray-300 mb-6">
                Set your availability so patients can book meetings with you.
              </p>
              <button
                onClick={() => {
                  setEditingAvailability(null)
                  setFormData({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' })
                  setShowForm(true)
                }}
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
                        onClick={() => handleEdit(avail)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-500/20 rounded-lg"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(avail.id)}
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

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link
            to="/doctor/meetings"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-400 hover:to-blue-500 transition-all duration-300 font-medium shadow-lg mr-4"
          >
            📋 View Meetings
          </Link>
          <Link
            to="/doctor/dashboard"
            className="inline-block px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 font-medium shadow-lg"
          >
            🏠 Dashboard
          </Link>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {editingAvailability ? '✏️ Edit Availability' : '➕ Add Availability'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingAvailability(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all duration-300 font-medium"
                >
                  {editingAvailability ? 'Update' : 'Add'} Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorAvailability