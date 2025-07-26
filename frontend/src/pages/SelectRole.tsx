import { useNavigate } from 'react-router-dom'

export default function SelectRole() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">🧠</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">💊</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">🩺</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">💖</div>
        <div className="absolute top-1/2 left-16 text-white/10 text-3xl animate-float animation-delay-8000">🌟</div>
        <div className="absolute top-3/4 right-16 text-white/10 text-3xl animate-float animation-delay-9000">✨</div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8 animate-fade-in-up">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in-down">
            <div className="mb-6">
              <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                MindCare
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-200 mb-4 animate-fade-in animation-delay-1000">
              🌟 Your mental health journey starts here
            </p>
            <p className="text-lg text-gray-300 animate-fade-in animation-delay-2000">
              Choose your role to continue
            </p>
          </div>
          
          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Doctor Card */}
            <div 
              onClick={() => navigate('/signup/doctor')}
              className="group cursor-pointer transform transition-all duration-500 hover:scale-105 animate-slide-in-left"
            >
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-emerald-400/50 transition-all duration-300">
                <div className="text-center">
                  <div className="text-6xl mb-6 animate-bounce animation-delay-1000">👨‍⚕️</div>
                  <h3 className="text-2xl font-bold text-emerald-300 mb-4 group-hover:text-emerald-200 transition-colors duration-300">
                    Healthcare Professional
                  </h3>
                  <p className="text-gray-200 mb-6 leading-relaxed">
                    Join as a licensed mental health professional to provide care, 
                    connect with patients, and make a difference in mental wellness.
                  </p>
                  <div className="space-y-2 text-sm text-gray-300 mb-6">
                    <div className="flex items-center justify-center">
                      <span className="mr-2">🩺</span>
                      Professional Dashboard
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="mr-2">👥</span>
                      Patient Management
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="mr-2">📊</span>
                      Treatment Analytics
                    </div>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-200 px-6 py-3 rounded-xl font-medium group-hover:bg-emerald-500/30 transition-all duration-300">
                    🚀 Get Started as Doctor
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Card */}
            <div 
              onClick={() => navigate('/signup/patient')}
              className="group cursor-pointer transform transition-all duration-500 hover:scale-105 animate-slide-in-right"
            >
              <div className="bg-gradient-to-br from-rose-500/20 to-pink-600/20 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-rose-400/50 transition-all duration-300">
                <div className="text-center">
                  <div className="text-6xl mb-6 animate-bounce animation-delay-2000">🧠</div>
                  <h3 className="text-2xl font-bold text-rose-300 mb-4 group-hover:text-rose-200 transition-colors duration-300">
                    Seeking Support
                  </h3>
                  <p className="text-gray-200 mb-6 leading-relaxed">
                    Begin your mental health journey with professional support, 
                    personalized care plans, and a community that understands.
                  </p>
                  <div className="space-y-2 text-sm text-gray-300 mb-6">
                    <div className="flex items-center justify-center">
                      <span className="mr-2">💖</span>
                      Personal Wellness Hub
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="mr-2">📅</span>
                      Easy Appointment Booking
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="mr-2">🌱</span>
                      Progress Tracking
                    </div>
                  </div>
                  <div className="bg-rose-500/20 text-rose-200 px-6 py-3 rounded-xl font-medium group-hover:bg-rose-500/30 transition-all duration-300">
                    💫 Start Your Journey
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login Section */}
          <div className="text-center animate-fade-in-up animation-delay-4000">
            <p className="text-gray-300 mb-6 text-lg">
              Already have an account? Welcome back! ✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/login/doctor')}
                className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-medium hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 transform hover:scale-105 min-w-[200px]"
              >
                <span className="mr-2">👨‍⚕️</span>
                Doctor Login
              </button>
              <button 
                onClick={() => navigate('/login/patient')}
                className="group bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-xl font-medium hover:from-rose-400 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 min-w-[200px]"
              >
                <span className="mr-2">🧠</span>
                Patient Login
              </button>
            </div>
            
            {/* Admin Login - Discrete */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={() => navigate('/login/admin')}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-white/5"
              >
                🔧 Admin Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
