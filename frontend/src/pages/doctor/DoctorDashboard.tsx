import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Bot } from 'lucide-react'
import { API_BASE_URL } from '../../config/api'
import ReportUserModal from '../../components/ReportUserModal'
import UnifiedMeetingCalendar from '../../components/UnifiedMeetingCalendar'
import MeetingDetailModal from '../../components/MeetingDetailModal'
import AIChatbot from '../../components/AIChatbot'

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

const DoctorDashboard = () => {
  const [patients, setPatients] = useState<any[]>([])
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportingPatient, setReportingPatient] = useState<{ id: number; name: string; role: 'patient' } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  useEffect(() => {
    console.log('DoctorDashboard mounted')
    fetchApprovedEnrollments()
  }, [])

  const fetchApprovedEnrollments = () => {
    console.log('Fetching doctor enrollments...')
    setLoading(true)
    setError('')
    
    axios.get(`${API_BASE_URL}/doctor/enrollments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      console.log('Doctor enrollments response:', res.data)
      const patientsData = Array.isArray(res.data) ? res.data : []
      setPatients(patientsData)
      setLoading(false)
    })
    .catch(err => {
      console.error('Error fetching patients:', err)
      setError('Failed to load patients')
      setPatients([])
      setLoading(false)
    })
  }

  const handleReportPatient = (patient: any) => {
    setReportingPatient({
      id: patient.Patient?.id || patient.patientId,
      name: patient.Patient?.name || 'Unknown Patient',
      role: 'patient'
    })
    setReportModalOpen(true)
  }

  const handleReportSubmitted = () => {
    setReportModalOpen(false)
    setReportingPatient(null)
  }

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setShowMeetingModal(true)
  }

  const handleMeetingModalClose = () => {
    setShowMeetingModal(false)
    setSelectedMeeting(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden font-inter">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading doctor dashboard...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
            <div className="absolute top-40 right-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
            <div className="absolute bottom-20 left-20 w-36 h-36 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
            <div className="absolute bottom-40 right-10 w-28 h-28 bg-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
          </div>

          <div className="relative z-10 p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                Doctor Dashboard
              </h1>
              <p className="text-purple-200 text-lg">
                Healing minds, changing lives, one patient at a time
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Link 
                to="/doctor/chat" 
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white p-6 rounded-2xl shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-3">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold text-center">Chat with Patients</h3>
                <p className="text-purple-100 text-center mt-2">Secure communication platform</p>
              </Link>

              <Link 
                to="/doctor/availability" 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white p-6 rounded-2xl shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-3">
                  <span className="text-4xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold text-center">Set Availability</h3>
                <p className="text-emerald-100 text-center mt-2">Manage your schedule</p>
              </Link>

              <Link 
                to="/doctor/meetings" 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white p-6 rounded-2xl shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-3">
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="text-xl font-semibold text-center">Meeting Requests</h3>
                <p className="text-blue-100 text-center mt-2">Approve and manage appointments</p>
              </Link>

              <Link 
                to="/doctor/profile" 
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white p-6 rounded-2xl shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-3">
                  <span className="text-4xl">👤</span>
                </div>
                <h3 className="text-xl font-semibold text-center">Edit Profile</h3>
                <p className="text-orange-100 text-center mt-2">Update your professional information</p>
              </Link>

              <Link 
                to="/doctor/change-password" 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white p-6 rounded-2xl shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-3">
                  <span className="text-4xl">🔐</span>
                </div>
                <h3 className="text-xl font-semibold text-center">Change Password</h3>
                <p className="text-indigo-100 text-center mt-2">Update your account security</p>
              </Link>
            </div>
            
            {/* My Patients Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                👥 My Patients
              </h2>
              
              {patients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🩺</div>
                  <p className="text-gray-300 text-lg">No enrolled patients yet.</p>
                  <p className="text-gray-400 text-sm">Approved enrollments will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {patients.map((enroll: any) => (
                    <div 
                      key={enroll.id} 
                      className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 backdrop-blur-sm transition-all duration-300"
                    >
                      <div className="flex items-center mb-4">
                        <span className="text-3xl mr-4">🧠</span>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{enroll.Patient?.name || 'N/A'}</h3>
                          <p className="text-emerald-300 text-sm">📧 {enroll.Patient?.email || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          ✅ Active Patient
                        </span>
                        <div className="flex space-x-3">
                          <button className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center">
                            <span className="mr-2">💬</span>
                            Chat
                          </button>
                          <button 
                            onClick={() => handleReportPatient(enroll)}
                            className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center"
                            title="Report inappropriate behavior"
                          >
                            <span className="mr-2">🚨</span>
                            Report
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meeting Calendar Section */}
            <UnifiedMeetingCalendar 
              userRole="doctor"
              onMeetingClick={handleMeetingClick}
            />
          </div>

          {/* Report Modal */}
          {reportingPatient && (
            <ReportUserModal
              isOpen={reportModalOpen}
              onClose={() => {
                setReportModalOpen(false)
                setReportingPatient(null)
              }}
              reportedUser={reportingPatient}
              onReportSubmitted={handleReportSubmitted}
            />
          )}

          {/* Meeting Detail Modal */}
          {selectedMeeting && (
            <MeetingDetailModal
              meeting={selectedMeeting}
              userRole="doctor"
              isOpen={showMeetingModal}
              onClose={handleMeetingModalClose}
            />
          )}

          {/* Floating Chatbot Button */}
          <button
            onClick={() => setIsChatbotOpen(true)}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 z-40 group"
            title="Open AI Assistant"
          >
            <Bot className="h-6 w-6" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              !
            </div>
            <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              AI Mental Health Assistant
            </span>
          </button>

          {/* AI Chatbot Component */}
          <AIChatbot 
            isOpen={isChatbotOpen} 
            onClose={() => setIsChatbotOpen(false)} 
          />
        </>
      )}
    </div>
  )
}

export default DoctorDashboard
