import { useState, useEffect } from 'react'
import axios from 'axios'

interface CalendarProps {
  selectedDoctor: {
    id: number
    Doctor: {
      id: number
      name: string
      DoctorDetail?: {
        specialization: string
      }
    }
  }
  onClose: () => void
  onMeetingRequested: () => void
}

interface TimeSlot {
  time: string
  available: boolean
  hasExistingMeeting?: boolean
}

const MeetingCalendar = ({ selectedDoctor, onClose, onMeetingRequested }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [showTimeSlots, setShowTimeSlots] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form fields
  const [duration, setDuration] = useState(60)
  const [patientNotes, setPatientNotes] = useState('')

  // Generate time slots from 9 AM to 5 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push({
          time,
          available: true // We'll check this against existing meetings
        })
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Get days in current month
  const getDaysInMonth = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
    }
    
    return days
  }

  const handleDateClick = (date: Date) => {
    if (date < new Date().setHours(0, 0, 0, 0)) return // Don't allow past dates
    
    setSelectedDate(date)
    setShowTimeSlots(true)
  }

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return
    
    setSelectedTimeSlot(timeSlot.time)
    setShowBookingForm(true)
  }

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTimeSlot) return

    setLoading(true)
    setError('')

    try {
      const scheduledDateTime = new Date(selectedDate)
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number)
      scheduledDateTime.setHours(hours, minutes, 0, 0)

      await axios.post('http://localhost:5000/api/meetings/request', {
        doctorId: selectedDoctor.Doctor.id,
        enrollmentId: selectedDoctor.id,
        scheduledAt: scheduledDateTime.toISOString(),
        patientNotes,
        duration
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      onMeetingRequested()
      onClose()
    } catch (error: any) {
      console.error('Error booking meeting:', error)
      setError(error.response?.data?.error || 'Failed to book meeting')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDate(null)
    setShowTimeSlots(false)
    setShowBookingForm(false)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">📅 Schedule Meeting</h3>
              <div className="flex items-center mt-2">
                <span className="text-3xl mr-3">👨‍⚕️</span>
                <div>
                  <h4 className="text-white font-semibold text-lg">
                    Dr. {selectedDoctor.Doctor.name}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {selectedDoctor.Doctor.DoctorDetail?.specialization || 'General Practice'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-400/30 text-red-300 p-3 rounded-xl">
              {error}
            </div>
          )}

          {!showTimeSlots && !showBookingForm && (
            <div className="space-y-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h4 className="text-xl font-semibold text-white">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Week Day Headers */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-gray-300 font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth().map((date, index) => (
                  <div key={index} className="aspect-square">
                    {date && (
                      <button
                        onClick={() => handleDateClick(date)}
                        disabled={isPastDate(date)}
                        className={`w-full h-full rounded-xl transition-all duration-300 flex items-center justify-center font-medium ${
                          isPastDate(date)
                            ? 'text-gray-500 cursor-not-allowed'
                            : isToday(date)
                            ? 'bg-purple-500 text-white shadow-lg'
                            : selectedDate?.toDateString() === date.toDateString()
                            ? 'bg-purple-400 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center text-gray-300 text-sm">
                Click on a date to view available time slots
              </div>
            </div>
          )}

          {/* Time Slots View */}
          {showTimeSlots && !showBookingForm && selectedDate && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-white">Available Time Slots</h4>
                  <p className="text-gray-300">{formatDate(selectedDate)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowTimeSlots(false)
                    setSelectedDate(null)
                  }}
                  className="text-purple-300 hover:text-white transition-colors"
                >
                  ← Back to Calendar
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSlotClick(slot)}
                    disabled={!slot.available}
                    className={`p-3 rounded-xl transition-all duration-300 font-medium ${
                      slot.available
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-white hover:from-green-400/30 hover:to-emerald-400/30 hover:scale-105'
                        : 'bg-red-500/20 border border-red-400/30 text-red-300 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-lg">{slot.time}</div>
                    <div className="text-xs">
                      {slot.available ? 'Available' : 'Booked'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Booking Form */}
          {showBookingForm && selectedDate && selectedTimeSlot && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-white">Confirm Booking</h4>
                  <p className="text-gray-300">
                    {formatDate(selectedDate)} at {selectedTimeSlot}
                  </p>
                </div>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-purple-300 hover:text-white transition-colors"
                >
                  ← Back to Time Slots
                </button>
              </div>

              <form onSubmit={handleBookMeeting} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    ⏱️ Duration (minutes)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={30} className="bg-gray-800">30 minutes</option>
                    <option value={60} className="bg-gray-800">60 minutes</option>
                    <option value={90} className="bg-gray-800">90 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    📝 Notes (optional)
                  </label>
                  <textarea
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    placeholder="Brief description of what you'd like to discuss..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MeetingCalendar
