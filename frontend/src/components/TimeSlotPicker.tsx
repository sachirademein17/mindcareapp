// 📁 frontend/src/components/TimeSlotPicker.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface TimeSlotPickerProps {
  doctorId: number
  enrollmentId: number
  onSlotSelected: (slotId: number, dateTime: string) => void
  onCancel: () => void
}

interface DoctorAvailability {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface TimeSlot {
  id: string
  date: string
  time: string
  datetime: string
  available: boolean
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  doctorId,
  enrollmentId,
  onSlotSelected,
  onCancel
}) => {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [patientNotes, setPatientNotes] = useState('')
  const [consultationFee, setConsultationFee] = useState<number>(0)

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useEffect(() => {
    fetchDoctorAvailability()
    fetchDoctorDetails()
  }, [doctorId])

  useEffect(() => {
    if (selectedDate && availability.length > 0) {
      generateTimeSlots()
    }
  }, [selectedDate, availability])

  const fetchDoctorAvailability = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/meetings/availability/${doctorId}`)
      setAvailability(response.data.availabilities || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching doctor availability:', error)
      setLoading(false)
    }
  }

  const fetchDoctorDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/patient/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.data.DoctorDetail?.consultationFee) {
        setConsultationFee(response.data.DoctorDetail.consultationFee)
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error)
    }
  }

  const generateTimeSlots = () => {
    const date = new Date(selectedDate)
    const dayOfWeek = date.getDay()
    
    // Find availability for this day of week
    const dayAvailability = availability.filter(avail => avail.dayOfWeek === dayOfWeek && avail.isActive)
    
    if (dayAvailability.length === 0) {
      setTimeSlots([])
      return
    }

    const slots: TimeSlot[] = []
    
    dayAvailability.forEach(avail => {
      const startHour = parseInt(avail.startTime.split(':')[0])
      const endHour = parseInt(avail.endTime.split(':')[0])
      
      // Generate hourly slots
      for (let hour = startHour; hour < endHour; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`
        const datetime = `${selectedDate}T${timeString}:00`
        const dateTime = new Date(datetime)
        
        // Only show future time slots
        if (dateTime > new Date()) {
          slots.push({
            id: `${selectedDate}-${timeString}`,
            date: selectedDate,
            time: timeString,
            datetime: datetime,
            available: true // TODO: Check against existing bookings
          })
        }
      }
    })
    
    setTimeSlots(slots.sort((a, b) => a.time.localeCompare(b.time)))
  }

  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    // Generate next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dayOfWeek = date.getDay()
      
      // Check if doctor has availability on this day
      const hasAvailability = availability.some(avail => 
        avail.dayOfWeek === dayOfWeek && avail.isActive
      )
      
      if (hasAvailability) {
        dates.push(date.toISOString().split('T')[0])
      }
    }
    
    return dates
  }

  const handleBookMeeting = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot')
      return
    }

    try {
      const [date, time] = selectedSlot.datetime.split('T')
      const startTime = time.split(':').slice(0, 2).join(':') // HH:MM format

      const response = await axios.post('http://localhost:5000/api/meetings/book', {
        doctorId,
        enrollmentId,
        meetingDate: date,
        startTime,
        patientNotes
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      // If we get a client secret, redirect to payment
      if (response.data.clientSecret) {
        alert('Meeting booked! Redirecting to payment...')
        // TODO: Integrate with Stripe payment flow
        // For now, we'll just call the onSlotSelected callback
        onSlotSelected(response.data.meeting.id, selectedSlot.datetime)
      } else {
        onSlotSelected(response.data.meeting.id, selectedSlot.datetime)
      }
    } catch (error: any) {
      console.error('Error booking meeting:', error)
      const errorMessage = error.response?.data?.error || 'Failed to book meeting'
      alert(`❌ ${errorMessage}`)
    }
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':')
    const hourNum = parseInt(hour)
    const ampm = hourNum >= 12 ? 'PM' : 'AM'
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
    return `${displayHour}:${minute} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctor availability...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📅 Book Meeting</h2>
              <p className="text-blue-100">Select your preferred time slot</p>
              {consultationFee > 0 && (
                <p className="text-blue-100 mt-1">💰 Consultation Fee: ${consultationFee}/hour</p>
              )}
            </div>
            <button 
              onClick={onCancel}
              className="text-white hover:text-gray-200 text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {availability.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Availability Set</h3>
              <p className="text-gray-500">This doctor hasn't set their availability yet.</p>
            </div>
          ) : (
            <>
              {/* Doctor's Schedule Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-gray-700 mb-2">👨‍⚕️ Doctor's Schedule</h3>
                <div className="grid grid-cols-1 gap-2">
                  {availability.map(avail => (
                    <div key={avail.id} className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-20">{dayNames[avail.dayOfWeek]}:</span>
                      <span>{formatTime(avail.startTime)} - {formatTime(avail.endTime)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📅 Select Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setSelectedSlot(null)
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a date...</option>
                  {getAvailableDates().map(date => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ⏰ Select Time Slot
                  </label>
                  {timeSlots.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No available time slots for this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {timeSlots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          disabled={!slot.available}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                            selectedSlot?.id === slot.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : slot.available
                              ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Patient Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📝 Notes (Optional)
                </label>
                <textarea
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Share any specific concerns or topics you'd like to discuss..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookMeeting}
                  disabled={!selectedSlot}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-400 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  📅 Book Meeting
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TimeSlotPicker
