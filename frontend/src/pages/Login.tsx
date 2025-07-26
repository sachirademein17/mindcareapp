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
      const res = await axios.post(`http://localhost:5000/api/auth/${role}/login`, { email, password })
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

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
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">🔐</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">💼</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">✨</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">🌟</div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in-up">
          {/* Header Section */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                MindCare
              </h1>
            </div>
            <div className="text-2xl font-bold text-white mb-2 capitalize animate-fade-in">
              {role === 'doctor' ? '👨‍⚕️' : '🧠'} {role} Login
            </div>
            <p className="text-gray-300 animate-fade-in animation-delay-1000">
              Welcome back! Ready to continue your journey?
            </p>
          </div>
          
          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-in-left">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  📧 Email Address
                </label>
                <input 
                  id="email"
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                />
              </div>
              
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  🔒 Password
                </label>
                <input 
                  id="password"
                  type="password" 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                />
              </div>
              
              <button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="group relative w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-cyan-400 hover:to-purple-500 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Sign In
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </button>
            </div>
            
            <div className="text-center mt-6 animate-fade-in-up animation-delay-2000">
              <p className="text-sm text-gray-300">
                Don't have an account?{' '}
                <Link 
                  to={`/signup/${role}`} 
                  className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover:underline"
                >
                  ✨ Sign up here
                </Link>
              </p>
            </div>

            <div className="text-center mt-4 animate-fade-in-up animation-delay-3000">
              <Link 
                to="/" 
                className="text-xs text-gray-400 hover:text-gray-300 transition-colors duration-300"
              >
                ← Back to role selection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
