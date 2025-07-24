import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function SelectRole() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Removed floating emojis for cleaner design */}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in-down">
          <div className="mb-6">
            <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              MindCare
            </h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
            Choose Your Journey
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-up">
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
            className="group cursor-pointer transform transition-all duration-500 hover:scale-105 animate-slide-in-left"
          >
            <div className="relative bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Icon Container */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-6 transition-transform duration-500 ${hoveredCard === 'doctor' ? 'rotate-12 scale-110' : ''}`}>
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <span className="text-5xl">👨‍⚕️</span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-3 group-hover:scale-105 transition-transform duration-300">
                  Healthcare Provider
                </h3>
                
                <p className="text-white/90 text-lg mb-6 leading-relaxed">
                  Empower healing journeys and make a difference in mental wellness
                </p>
                
                <div className="flex items-center space-x-2 text-white/80 text-sm">
                  <span>Research</span>
                  <span>Professional Dashboard</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80 text-sm mt-2">
                  <span>👥</span>
                  <span>Patient Management</span>
                </div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-white/30 group-hover:border-white/60 transition-colors duration-300"></div>
                
                {/* Glowing Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              </div>
            </div>
          </div>

          {/* Patient Card */}
          <div
            onClick={() => navigate('/login/patient')}
            onMouseEnter={() => setHoveredCard('patient')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group cursor-pointer transform transition-all duration-500 hover:scale-105 animate-slide-in-right"
          >
            <div className="relative bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Icon Container */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-6 transition-transform duration-500 ${hoveredCard === 'patient' ? 'rotate-12 scale-110' : ''}`}>
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <span className="text-5xl">Mind</span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-3 group-hover:scale-105 transition-transform duration-300">
                  Seeking Wellness
                </h3>
                
                <p className="text-white/90 text-lg mb-6 leading-relaxed">
                  Begin your journey to mental wellness with personalized care
                </p>
                
                <div className="flex items-center space-x-2 text-white/80 text-sm">
                  <span>💬</span>
                  <span>Chat with Professionals</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80 text-sm mt-2">
                  <span>📅</span>
                  <span>Schedule Sessions</span>
                </div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-white/30 group-hover:border-white/60 transition-colors duration-300"></div>
                
                {/* Glowing Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-rose-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-16 text-center animate-fade-in-up animation-delay-2000">
          <p className="text-gray-400 text-lg">
            Your mental health journey starts here
          </p>
        </div>
      </div>
    </div>
  )
}
