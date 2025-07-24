import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'

export default function Login() {
  const { role } = useParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const res = await axios.post(`http://localhost:5000/auth/${role}/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userId', res.data.user.id.toString())
      localStorage.setItem('role', role || '')
      navigate(`/${role}/dashboard`)
    } catch (err) {
      setError('Invalid credentials or unapproved user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  // Generate particles for background
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 6
  }))

  // Role-specific theming
  const getRoleTheme = () => {
    switch (role) {
      case 'doctor':
        return {
          bgClass: 'doctor-bg',
          cardClass: 'glass-doctor',
          accentClass: 'doctor-accent',
          gradientText: 'gradient-doctor',
          borderColor: 'border-emerald-300/30',
          focusColor: 'focus:ring-emerald-400',
          buttonGradient: 'from-emerald-600 to-green-600',
          buttonHover: 'hover:from-emerald-500 hover:to-green-500',
          textColor: 'text-emerald-100',
          iconColor: 'text-emerald-200'
        }
      case 'patient':
        return {
          bgClass: 'patient-bg',
          cardClass: 'glass-patient',
          accentClass: 'patient-accent',
          gradientText: 'gradient-patient',
          borderColor: 'border-sky-300/30',
          focusColor: 'focus:ring-sky-400',
          buttonGradient: 'from-sky-600 to-blue-600',
          buttonHover: 'hover:from-sky-500 hover:to-blue-500',
          textColor: 'text-sky-100',
          iconColor: 'text-sky-200'
        }
      case 'admin':
        return {
          bgClass: 'admin-bg',
          cardClass: 'glass-admin',
          accentClass: 'admin-accent',
          gradientText: 'gradient-admin',
          borderColor: 'border-purple-300/30',
          focusColor: 'focus:ring-purple-400',
          buttonGradient: 'from-purple-600 to-violet-600',
          buttonHover: 'hover:from-purple-500 hover:to-violet-500',
          textColor: 'text-purple-100',
          iconColor: 'text-purple-200'
        }
      default:
        return {
          bgClass: 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900',
          cardClass: 'glass-ultimate',
          accentClass: 'bg-gradient-to-r from-purple-600 to-pink-600',
          gradientText: 'text-holographic',
          borderColor: 'border-purple-300/30',
          focusColor: 'focus:ring-purple-400',
          buttonGradient: 'from-purple-600 to-pink-600',
          buttonHover: 'hover:from-purple-500 hover:to-pink-500',
          textColor: 'text-purple-100',
          iconColor: 'text-purple-200'
        }
    }
  }

  const theme = getRoleTheme()

  // Helper functions for cleaner JSX
  const getRoleTitle = () => {
    if (role === 'doctor') return '🩺 Healthcare Provider'
    if (role === 'patient') return '🧠 Wellness Seeker'
    return '⚡ System Admin'
  }

  const getWelcomeMessage = () => {
    if (role === 'doctor') return 'patients'
    if (role === 'patient') return 'wellness journey'
    return 'system'
  }

  const getButtonText = () => {
    if (role === 'doctor') return 'Healing Portal'
    if (role === 'patient') return 'Wellness Hub'
    return 'Control Center'
  }

  const getFooterMessage = () => {
    if (role === 'doctor') return 'Heal. Inspire. Transform Lives.'
    if (role === 'patient') return 'Your Journey to Wellness Begins Now.'
    return 'Manage. Monitor. Make a Difference.'
  }

  return (
    <div className={`min-h-screen ${theme.bgClass} relative overflow-hidden font-inter`}>
      {/* Advanced Background Effects */}
      <div className="absolute inset-0 animate-liquid opacity-20">
        <div className={`absolute inset-0 ${theme.accentClass} opacity-10`}></div>
      </div>

      {/* Floating Particles System */}
      <div className="particles absolute inset-0">
        {particles.map((particle) => (
          <div
            key={`login-particle-${particle.id}`}
            className="particle absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Morphing Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 animate-morphing opacity-15 filter blur-xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-r from-blue-500 to-cyan-500 animate-float3d opacity-15 filter blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-gradient-to-r from-emerald-500 to-green-500 animate-breathe opacity-15 filter blur-xl"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-to-r from-violet-500 to-purple-500 animate-levitate opacity-15 filter blur-xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8">
          {/* Spectacular Header Section */}
          <div className="text-center mb-12">
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl font-extrabold font-playfair text-holographic hover-glow animate-breathe">
                MindCare
              </h1>
            </div>
            <div className={`text-3xl md:text-4xl font-bold text-white mb-4 capitalize font-space ${theme.gradientText}`}>
              {getRoleTitle()} Portal
            </div>
            <p className={`text-xl ${theme.textColor} font-outfit`}>
              Welcome back! Your {getWelcomeMessage()} awaits.
            </p>
          </div>
          
          {/* Enhanced Login Card */}
          <div className={`${theme.cardClass} rounded-3xl shadow-2xl p-10 border ${theme.borderColor} glass-card-hover animate-levitate`}>
            {/* Role-specific accent bar */}
            <div className={`h-1 ${theme.accentClass} rounded-full mb-8 animate-breathe`}></div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-6 py-4 rounded-xl mb-8 backdrop-blur-sm glass-ultimate animate-float3d">
                <div className="flex items-center">
                  <span className="mr-3 text-xl" aria-hidden="true">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-8">
              <div className="group">
                <label htmlFor="email" className={`block text-lg font-medium ${theme.textColor} mb-3 font-outfit flex items-center`}>
                  <span className="mr-2 text-xl" aria-hidden="true">
                    📧
                  </span>
                  Email Address
                </label>
                <input 
                  id="email"
                  type="email" 
                  placeholder="Enter your professional email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-6 py-4 ${theme.cardClass} border ${theme.borderColor} rounded-xl text-white placeholder-gray-300 ${theme.focusColor} focus:border-transparent transition-all duration-300 backdrop-blur-sm text-lg font-outfit hover-glow`}
                />
              </div>
              
              <div className="group">
                <label htmlFor="password" className={`block text-lg font-medium ${theme.textColor} mb-3 font-outfit flex items-center`}>
                  <span className="mr-2 text-xl" aria-hidden="true">
                    🔐
                  </span>
                  Password
                </label>
                <input 
                  id="password"
                  type="password" 
                  placeholder="Enter your secure password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-6 py-4 ${theme.cardClass} border ${theme.borderColor} rounded-xl text-white placeholder-gray-300 ${theme.focusColor} focus:border-transparent transition-all duration-300 backdrop-blur-sm text-lg font-outfit hover-glow`}
                />
              </div>
              
              <button 
                onClick={handleLogin} 
                disabled={isLoading}
                className={`group relative w-full bg-gradient-to-r ${theme.buttonGradient} text-white py-4 px-6 rounded-xl font-bold text-lg font-space ${theme.buttonHover} focus:ring-2 ${theme.focusColor} focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 btn-morphic btn-3d disabled:opacity-50 disabled:cursor-not-allowed hover-lift`}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="loader-morphic w-6 h-6 mr-3"></div>
                      <span className="animate-glow">Authenticating...</span>
                    </>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2 text-xl" aria-hidden="true">✨</span>
                      Access {getButtonText()}
                    </span>
                  )}
                </span>
              </button>
            </div>
            
            <div className="text-center mt-8 space-y-4">
              <p className={`text-lg ${theme.textColor} font-outfit`}>
                New to our platform?{' '}
                <Link 
                  to={`/signup/${role}`} 
                  className={`font-bold ${theme.gradientText} hover:scale-105 transition-all duration-300 hover:underline text-liquid`}
                >
                  Create Your Account
                </Link>
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <div className={`h-px flex-1 ${theme.accentClass} opacity-30`}></div>
                <span className={`text-sm ${theme.iconColor} font-space`}>or</span>
                <div className={`h-px flex-1 ${theme.accentClass} opacity-30`}></div>
              </div>
              
              <Link 
                to="/" 
                className={`inline-flex items-center text-lg ${theme.iconColor} hover:text-white transition-all duration-300 font-outfit hover-glow`}
              >
                <span className="mr-2" aria-hidden="true">
                  ←
                </span>
                Choose Different Role
              </Link>
            </div>
          </div>

          {/* Role-specific Footer Message */}
          <div className="text-center mt-8">
            <p className={`text-xl ${theme.gradientText} font-playfair animate-glow`}>
              {getFooterMessage()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
