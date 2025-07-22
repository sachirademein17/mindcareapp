import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import MeetingCalendar from '../common/MeetingCalendar'

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([])
  const [allEnrollments, setAllEnrollments] = useState([])
  const [patientId, setPatientId] = useState<number>(0)

  useEffect(() => {
    // Get patient ID from localStorage
    const userId = localStorage.getItem('userId')
    if (userId) {
      setPatientId(parseInt(userId))
    }
    
    fetchApprovedEnrollments()
    fetchAllEnrollments()
  }, [])

  const fetchApprovedEnrollments = () => {
    axios.get('http://localhost:5000/patient/enrollments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setDoctors(res.data))
      .catch(err => console.error('Error fetching doctors:', err))
  }

  const fetchAllEnrollments = () => {
    axios.get('http://localhost:5000/patient/all-enrollments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setAllEnrollments(res.data))
      .catch(err => console.error('Error fetching all enrollments:', err))
  }

  const handleCancelEnrollment = async (doctorId: number) => {
    try {
      await axios.delete(`http://localhost:5000/patient/cancel-enrollment/${doctorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('Enrollment request cancelled!')
      fetchAllEnrollments()
      fetchApprovedEnrollments()
    } catch (err) {
      console.error('Error cancelling enrollment:', err)
      alert('Failed to cancel enrollment')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">🧠</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">💊</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">📋</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">🌟</div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Patient Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            🌟 Your journey to mental wellness starts here
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
          <Link 
            to="/patient/find-doctors" 
            className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center mb-3">
              <span className="text-4xl group-hover:animate-bounce">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-center">Find New Doctors</h3>
            <p className="text-blue-100 text-center mt-2">Discover qualified mental health professionals</p>
          </Link>

          <Link 
            to="/patient/prescriptions" 
            className="group bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-400 hover:to-teal-500 text-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center mb-3">
              <span className="text-4xl group-hover:animate-bounce">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-center">View Prescriptions</h3>
            <p className="text-green-100 text-center mt-2">Access your medical prescriptions</p>
          </Link>

          <Link 
            to="/patient/chat" 
            className="group bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center mb-3">
              <span className="text-4xl group-hover:animate-bounce">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-center">Chat with Doctors</h3>
            <p className="text-purple-100 text-center mt-2">Connect and communicate securely</p>
          </Link>
        </div>

        {/* Meeting Calendar Section */}
        <div className="mb-8 animate-slide-in-left">
          <MeetingCalendar userId={patientId} enrollments={doctors} />
        </div>

        {/* Enrollment Requests Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 mb-8 animate-slide-in-right">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            📋 All Enrollment Requests
          </h2>
          
          {allEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-300 text-lg">No enrollment requests yet.</p>
              <p className="text-gray-400 text-sm">Start by finding a doctor!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allEnrollments.map((enroll: any, index: number) => (
                <div 
                  key={enroll.id} 
                  className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-102 animate-fade-in-up ${
                    enroll.status === 'approved' 
                      ? 'bg-green-500/20 border-green-400/30 hover:bg-green-500/30' :
                    enroll.status === 'pending' 
                      ? 'bg-yellow-500/20 border-yellow-400/30 hover:bg-yellow-500/30' :
                    'bg-red-500/20 border-red-400/30 hover:bg-red-500/30'
                  }`}
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">👨‍⚕️</span>
                        <div>
                          <p className="text-white font-semibold text-lg">{enroll.Doctor?.name || 'N/A'}</p>
                          <p className="text-gray-300 text-sm">📧 {enroll.Doctor?.email || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          enroll.status === 'approved' 
                            ? 'bg-green-500 text-white' :
                          enroll.status === 'pending' 
                            ? 'bg-yellow-500 text-black' :
                          'bg-red-500 text-white'
                        }`}>
                          {enroll.status === 'approved' ? '✅ Approved' :
                           enroll.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                        </span>
                        <span className="text-gray-400 text-sm ml-4">
                          📅 {new Date(enroll.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {enroll.status === 'pending' && (
                      <button
                        onClick={() => handleCancelEnrollment(enroll.doctorId)}
                        className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                      >
                        ❌ Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Doctors Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-in-left">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            👨‍⚕️ My Current Doctors
          </h2>
          
          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🩺</div>
              <p className="text-gray-300 text-lg">No enrolled doctors yet.</p>
              <p className="text-gray-400 text-sm">Your approved enrollments will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((enroll: any, index: number) => (
                <div 
                  key={enroll.id} 
                  className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-6 rounded-2xl border border-emerald-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-4">👨‍⚕️</span>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{enroll.Doctor?.name || 'N/A'}</h3>
                      <p className="text-emerald-300 text-sm">📧 {enroll.Doctor?.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ✅ Active
                    </span>
                    <div className="flex space-x-2">
                      <button className="bg-purple-500 hover:bg-purple-400 text-white px-3 py-1 rounded-lg text-xs transition-all duration-300">
                        💬 Chat
                      </button>
                      <button className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded-lg text-xs transition-all duration-300">
                        📅 Meet
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
