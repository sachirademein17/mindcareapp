import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function SelectRole() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

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

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-6xl md:text-7xl font-extrabold font-poppins gradient-text hover:scale-105 transform transition-all duration-300">
              MindCare
            </h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-poppins">
            Choose Your Journey
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Join our mental health platform and connect with care that understands you
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
          {/* Doctor Card */}
          <div
            onClick={() => navigate('/login/doctor')}
            onMouseEnter={() => setHoveredCard('doctor')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div className="relative glass-purple rounded-3xl shadow-2xl p-8 border border-purple-300/20 overflow-hidden">
              {/* Icon Container */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-6 transition-transform duration-300 ${hoveredCard === 'doctor' ? 'scale-110' : ''}`}>
                  <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <span className="text-5xl">🩺</span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-3 font-poppins">
                  Healthcare Provider
                </h3>
                
                <p className="text-purple-100 text-lg mb-6 leading-relaxed">
                  Empower healing journeys and make a difference in mental wellness
                </p>
                
                <div className="flex items-center space-x-2 text-purple-200 text-sm">
                  <span>🔬</span>
                  <span>Professional Dashboard</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-200 text-sm mt-2">
                  <span>👥</span>
                  <span>Patient Management</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Card */}
          <div
            onClick={() => navigate('/login/patient')}
            onMouseEnter={() => setHoveredCard('patient')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div className="relative glass-purple rounded-3xl shadow-2xl p-8 border border-pink-300/20 overflow-hidden">
              {/* Icon Container */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-6 transition-transform duration-300 ${hoveredCard === 'patient' ? 'scale-110' : ''}`}>
                  <div className="w-24 h-24 bg-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <span className="text-5xl">🧠</span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-3 font-poppins">
                  Seeking Wellness
                </h3>
                
                <p className="text-pink-100 text-lg mb-6 leading-relaxed">
                  Begin your journey to mental wellness with personalized care
                </p>
                
                <div className="flex items-center space-x-2 text-pink-200 text-sm">
                  <span>💬</span>
                  <span>Chat with Professionals</span>
                </div>
                <div className="flex items-center space-x-2 text-pink-200 text-sm mt-2">
                  <span>📅</span>
                  <span>Schedule Sessions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-16 text-center">
          <p className="text-purple-300 text-lg font-poppins">
            Your mental health journey starts here ✨
          </p>
        </div>
      </div>
    </div>
  )
}
