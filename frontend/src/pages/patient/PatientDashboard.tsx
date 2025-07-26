import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import MeetingCalendar from '../common/MeetingCalendar'

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([])
  const [patientId, setPatientId] = useState<number>(0)

  useEffect(() => {
    // Get patient ID from localStorage
    const userId = localStorage.getItem('userId')
    if (userId) {
      setPatientId(parseInt(userId))
    }
    
    fetchApprovedEnrollments()
  }, [])

  const fetchApprovedEnrollments = () => {
    axios.get('http://localhost:5000/patient/enrollments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setDoctors(res.data))
      .catch(err => console.error('Error fetching doctors:', err))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden font-inter">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Removed floating emojis for cleaner design */}
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold font-poppins gradient-text mb-4 hover:scale-105 transform transition-all duration-300">
            Patient Dashboard
          </h1>
          <p className="text-purple-200 text-lg">
            Your journey to mental wellness starts here
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 animate-fade-in-up">
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

          <Link 
            to="/patient/profile" 
            className="group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center mb-3">
              <span className="text-4xl group-hover:animate-bounce">👤</span>
            </div>
            <h3 className="text-xl font-semibold text-center">Edit Profile</h3>
            <p className="text-orange-100 text-center mt-2">Update your personal information</p>
          </Link>

          <Link 
            to="/patient/change-password" 
            className="group bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-center mb-3">
              <span className="text-4xl group-hover:animate-bounce">🔐</span>
            </div>
            <h3 className="text-xl font-semibold text-center">Change Password</h3>
            <p className="text-indigo-100 text-center mt-2">Update your account security</p>
          </Link>
        </div>

        {/* Meeting Calendar Section */}
        <div className="mb-8 animate-slide-in-left">
          <MeetingCalendar userId={patientId} enrollments={doctors} />
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
