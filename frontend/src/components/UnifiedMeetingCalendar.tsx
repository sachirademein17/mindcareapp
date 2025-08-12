import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
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
    DoctorDetail?: {
      specialization: string
    }
  }
}

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    meeting: Meeting
    type: 'meeting'
  }
}

interface UnifiedMeetingCalendarProps {
  userRole: 'patient' | 'doctor'
  onMeetingClick?: (meeting: Meeting) => void
  compact?: boolean
}

const UnifiedMeetingCalendar = ({ userRole, onMeetingClick, compact = false }: UnifiedMeetingCalendarProps) => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    fetchMeetings()
  }, [userRole])

  useEffect(() => {
    // Convert meetings to calendar events
    const events = meetings.map(meeting => convertMeetingToEvent(meeting))
    setCalendarEvents(events)
  }, [meetings])

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      setError('')
      
      const endpoint = userRole === 'patient' 
        ? 'http://localhost:5000/api/meetings/patient'
        : 'http://localhost:5000/api/meetings/doctor'

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      const meetingsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.meetings || []
      
      setMeetings(meetingsData)
    } catch (error: any) {
      console.error('Error fetching meetings:', error)
      setError('Failed to fetch meetings')
    } finally {
      setLoading(false)
    }
  }

  const convertMeetingToEvent = (meeting: Meeting): CalendarEvent => {
    const startDate = new Date(meeting.scheduledAt)
    const endDate = new Date(startDate.getTime() + (meeting.duration * 60000)) // duration in minutes

    // Color scheme based on status
    const getStatusColors = (status: string) => {
      switch (status) {
        case 'pending':
          return { bg: '#FCD34D', border: '#F59E0B', text: '#92400E' } // Yellow
        case 'approved':
          return { bg: '#34D399', border: '#10B981', text: '#065F46' } // Green
        case 'rejected':
          return { bg: '#F87171', border: '#EF4444', text: '#991B1B' } // Red
        case 'cancelled':
          return { bg: '#9CA3AF', border: '#6B7280', text: '#374151' } // Gray
        case 'completed':
          return { bg: '#60A5FA', border: '#3B82F6', text: '#1E40AF' } // Blue
        default:
          return { bg: '#9CA3AF', border: '#6B7280', text: '#374151' } // Gray
      }
    }

    const colors = getStatusColors(meeting.status)
    
    // Title based on user role
    const getTitle = () => {
      if (userRole === 'patient') {
        return `Dr. ${meeting.Doctor?.name || 'Unknown'} - ${meeting.status}`
      } else {
        return `${meeting.Patient?.name || 'Unknown Patient'} - ${meeting.status}`
      }
    }

    return {
      id: meeting.id.toString(),
      title: getTitle(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text,
      extendedProps: {
        meeting,
        type: 'meeting'
      }
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const meeting = clickInfo.event.extendedProps.meeting
    if (onMeetingClick) {
      onMeetingClick(meeting)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'approved': return '✅'
      case 'rejected': return '❌'
      case 'cancelled': return '🚫'
      case 'completed': return '🏁'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">📅</div>
          <p>Loading calendar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="text-center text-red-300">
          <div className="text-4xl mb-4">❌</div>
          <p>{error}</p>
          <button 
            onClick={fetchMeetings}
            className="mt-4 bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          📅 Meeting Calendar
        </h2>
        <button 
          onClick={fetchMeetings}
          className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-300 text-lg">No meetings scheduled</p>
          <p className="text-gray-400 text-sm">
            {userRole === 'patient' 
              ? 'Schedule meetings with your doctors to see them here'
              : 'Meeting requests from patients will appear here'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Calendar */}
          <div className="bg-white rounded-2xl p-4 mb-6">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={compact ? 'dayGridMonth' : 'dayGridMonth'}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: compact ? 'dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              height={compact ? 400 : 600}
              eventDisplay="block"
              eventClassNames="cursor-pointer hover:shadow-lg transition-shadow"
              dayMaxEvents={compact ? 2 : 5}
              moreLinkClick="popover"
              nowIndicator={true}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
            />
          </div>

          {/* Legend */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">Status Legend:</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { status: 'pending', color: '#FCD34D', label: 'Pending' },
                { status: 'approved', color: '#34D399', label: 'Approved' },
                { status: 'rejected', color: '#F87171', label: 'Rejected' },
                { status: 'cancelled', color: '#9CA3AF', label: 'Cancelled' },
                { status: 'completed', color: '#60A5FA', label: 'Completed' }
              ].map(({ status, color, label }) => (
                <div key={status} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2"
                    style={{ backgroundColor: color, borderColor: color }}
                  ></div>
                  <span className="text-white text-sm">
                    {getStatusIcon(status)} {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { status: 'pending', label: 'Pending', icon: '⏳' },
              { status: 'approved', label: 'Approved', icon: '✅' },
              { status: 'rejected', label: 'Rejected', icon: '❌' },
              { status: 'cancelled', label: 'Cancelled', icon: '🚫' },
              { status: 'completed', label: 'Completed', icon: '🏁' }
            ].map(({ status, label, icon }) => {
              const count = meetings.filter(m => m.status === status).length
              return (
                <div key={status} className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-white font-bold text-lg">{count}</div>
                  <div className="text-gray-300 text-xs">{label}</div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default UnifiedMeetingCalendar



