import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Chat from '../common/Chat'

const PatientChat = () => {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovedDoctors()
  }, [])

  const fetchApprovedDoctors = () => {
    axios.get('http://localhost:5000/patient/enrollments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      setDoctors(res.data)
      // Auto-select first doctor if available
      if (res.data.length > 0) {
        setSelectedDoctor(res.data[0])
      }
      setLoading(false)
    })
      .catch(err => {
        console.error('Error fetching doctors:', err)
        setLoading(false)
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-fuchsia-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Chat Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">💬</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">🗨️</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">💭</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">✨</div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <Link 
            to="/patient/dashboard" 
            className="inline-flex items-center text-purple-300 hover:text-purple-200 transition-colors duration-300 mb-4 group"
          >
            <span className="mr-2 group-hover:translate-x-[-4px] transition-transform duration-300">←</span>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Chat with Doctors
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in animation-delay-1000">
            💬 Connect securely with your healthcare professionals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20 animate-slide-in-left">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                👨‍⚕️ Your Doctors
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading doctors...</p>
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="text-4xl mb-4">👨‍⚕️</div>
                  <p className="text-gray-300 mb-4">No enrolled doctors yet.</p>
                  <Link 
                    to="/patient/find-doctors"
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
                  >
                    <span className="mr-2">🔍</span>
                    Find Doctors
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {doctors.map((doctor: any, index: number) => (
                    <div 
                      key={doctor.Doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 animate-fade-in-up ${
                        selectedDoctor?.Doctor.id === doctor.Doctor.id 
                          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-400/50 shadow-lg' 
                          : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-400/30'
                      }`}
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">👨‍⚕️</span>
                        <div>
                          <h3 className="font-semibold text-white">{doctor.Doctor.name}</h3>
                          <p className="text-sm text-purple-300">{doctor.Doctor.email}</p>
                          <div className="flex items-center mt-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            <span className="text-xs text-green-300">Available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 animate-slide-in-right">
              {selectedDoctor ? (
                <div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-t-3xl border-b border-white/20">
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">👨‍⚕️</span>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Chat with Dr. {selectedDoctor.Doctor.name}
                        </h2>
                        <p className="text-purple-300 text-sm">
                          {selectedDoctor.Doctor.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Chat 
                    key={selectedDoctor.Doctor.id} 
                    receiverId={selectedDoctor.Doctor.id.toString()} 
                  />
                </div>
              ) : (
                <div className="p-8 text-center animate-fade-in">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Welcome to Chat
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Select a doctor from the list to start chatting
                  </p>
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-4">
                    <p className="text-purple-300 text-sm">
                      💡 Tip: All conversations are secure and confidential
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientChat
