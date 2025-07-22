import React, { useEffect, useState } from 'react'
import axios from 'axios'

const MeetingCalendar = ({ userId, enrollments }: { userId: number, enrollments: any[] }) => {
  const [events, setEvents] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDateTime, setSelectedDateTime] = useState('')
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/meetings/user/${userId}`).then(res => {
        const formatted = res.data.map((m: any) => ({
          id: m.id,
          title: `Therapy Session`,
          start: new Date(m.scheduledAt),
          end: new Date(new Date(m.scheduledAt).getTime() + 60 * 60000),
          url: m.meetingUrl,
        }))
        setEvents(formatted)
      }).catch(err => {
        console.error('Error loading meetings:', err)
      })
    }
  }, [userId])

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const selectedDate = new Date(date)
    selectedDate.setHours(hour, 0, 0, 0)
    setSelectedDateTime(selectedDate.toISOString())
    setShowCreateModal(true)
  }

  const handleCreateMeeting = async () => {
    if (!selectedEnrollmentId) {
      alert('Please select an enrollment')
      return
    }

    try {
      const res = await axios.post('http://localhost:5000/meetings', {
        enrollmentId: parseInt(selectedEnrollmentId),
        scheduledAt: selectedDateTime,
      })

      setEvents(prev => [...prev, {
        id: res.data.id,
        title: 'Therapy Session',
        start: new Date(res.data.scheduledAt),
        end: new Date(new Date(res.data.scheduledAt).getTime() + 60 * 60000),
        url: res.data.meetingUrl,
      }])

      setShowCreateModal(false)
      setSelectedEnrollmentId('')
      alert('🎉 Meeting scheduled successfully! Duration: 1 hour')
    } catch (err) {
      console.error('Error creating meeting:', err)
      alert('❌ Error creating meeting. Please try again.')
    }
  }

  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Monday start
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)
    
    // Adjust to start from Monday
    const startDay = firstDay.getDay()
    startDate.setDate(firstDay.getDate() - (startDay === 0 ? 6 : startDay - 1))
    
    // Adjust to end on Sunday
    const endDay = lastDay.getDay()
    endDate.setDate(lastDay.getDate() + (endDay === 0 ? 0 : 7 - endDay))

    const days = []
    const current = new Date(startDate)
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString() && 
             eventDate.getHours() === hour
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const formatTime = (hour: number) => {
    return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`
  }

  const weekDays = getWeekDays(currentDate)
  const monthDays = getMonthDays(currentDate)

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          📅 Meeting Calendar
          <span className="ml-3 text-sm bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
            1 Hour Sessions
          </span>
        </h2>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-xl p-1 flex">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                viewMode === 'week' 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                viewMode === 'month' 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-inner">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Previous
          </button>
          
          <h3 className="text-xl font-bold text-gray-800">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric',
              ...(viewMode === 'week' && { day: 'numeric' })
            })}
          </h3>
          
          <button
            onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Next →
          </button>
        </div>

        {viewMode === 'week' ? (
          /* Week View */
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-2 mb-2">
                {/* Time column header */}
                <div className="p-3 text-center font-semibold text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  Time
                </div>
                
                {/* Day headers */}
                {weekDays.map((day, index) => {
                  const isToday = day.toDateString() === new Date().toDateString()
                  return (
                    <div key={index} className={`p-3 text-center rounded-lg ${
                      isToday 
                        ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-300' 
                        : 'bg-gradient-to-r from-gray-50 to-gray-100'
                    }`}>
                      <div className={`font-semibold ${isToday ? 'text-blue-800' : 'text-gray-800'}`}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-sm ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Time slots */}
              {hours.map(hour => (
                <div key={hour} className="grid grid-cols-8 gap-2 mb-2">
                  {/* Time label */}
                  <div className="p-3 text-center text-sm font-medium text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    {formatTime(hour)}
                  </div>
                  
                  {/* Day slots */}
                  {weekDays.map((day, dayIndex) => {
                    const dayEvents = getEventsForDateAndHour(day, hour)
                    const isToday = day.toDateString() === new Date().toDateString()
                    const isPast = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour) < new Date()
                    
                    return (
                      <div
                        key={`${hour}-${dayIndex}`}
                        onClick={() => !isPast && handleTimeSlotClick(day, hour)}
                        className={`min-h-[70px] p-2 rounded-lg border-2 transition-all duration-300 relative ${
                          isPast 
                            ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                            : isToday 
                              ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150 hover:border-blue-300 cursor-pointer hover:shadow-lg transform hover:scale-105' 
                              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:from-emerald-50 hover:to-emerald-100 hover:border-emerald-300 cursor-pointer hover:shadow-lg transform hover:scale-105'
                        }`}
                      >
                        {dayEvents.map(event => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (event.url) window.open(event.url, '_blank')
                            }}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-2 rounded-lg text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer border border-emerald-400"
                          >
                            <div className="flex items-center">
                              <span className="mr-1">🩺</span>
                              {event.title}
                            </div>
                            <div className="text-emerald-100 text-xs mt-1">
                              Click to join
                            </div>
                          </div>
                        ))}
                        {!isPast && dayEvents.length === 0 && (
                          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                            Click to book
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Month View */
          <div>
            {/* Month headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Month days */}
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day, index) => {
                const dayEvents = events.filter(event => 
                  new Date(event.start).toDateString() === day.toDateString()
                )
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isToday = day.toDateString() === new Date().toDateString()
                const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-3 rounded-lg border-2 transition-all duration-300 ${
                      !isCurrentMonth 
                        ? 'bg-gray-50 border-gray-100 text-gray-400'
                        : isPast
                          ? 'bg-gray-100 border-gray-200 opacity-50'
                          : isToday 
                            ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-lg' 
                            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:from-emerald-50 hover:to-emerald-100 hover:border-emerald-300 hover:shadow-lg'
                    }`}
                  >
                    <div className={`text-sm font-bold mb-2 ${
                      isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={() => event.url && window.open(event.url, '_blank')}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-1 rounded text-xs font-medium cursor-pointer hover:shadow-lg transition-all duration-300 border border-emerald-400"
                        >
                          🩺 Session
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md rounded-3xl p-8 w-96 max-w-md mx-4 border border-white/30 shadow-2xl animate-slide-in-up">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Schedule New Session</h3>
              <p className="text-gray-600">Book a 1-hour therapy session</p>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🕐</span>
                <div>
                  <p className="font-semibold text-emerald-800">Selected Time:</p>
                  <p className="text-emerald-700">{new Date(selectedDateTime).toLocaleDateString()}</p>
                  <p className="text-emerald-700">{new Date(selectedDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  <p className="text-sm text-emerald-600 mt-1">⏱️ Duration: 1 hour</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2">👤</span>
                Select Patient/Doctor:
              </label>
              <select
                value={selectedEnrollmentId}
                onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-white/90 backdrop-blur-sm"
              >
                <option value="">Choose an enrollment...</option>
                {enrollments.map((enrollment: any) => (
                  <option key={enrollment.id} value={enrollment.id}>
                    {enrollment.Patient?.name || enrollment.Doctor?.name || `Enrollment ${enrollment.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-gray-500/20 text-gray-700 rounded-xl font-medium hover:bg-gray-500/30 transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMeeting}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
              >
                <span className="mr-2">🚀</span>
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MeetingCalendar
