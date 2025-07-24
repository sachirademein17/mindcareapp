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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
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

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Removed floating emojis for cleaner design */}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl font-extrabold font-poppins gradient-text hover:scale-105 transform transition-all duration-300">
                MindCare
              </h1>
            </div>
            <div className="text-2xl font-bold text-white mb-2 capitalize font-poppins">
              {role === 'doctor' ? 'Doctor' : 'Patient'} Login
            </div>
            <p className="text-purple-200">
              Welcome back! Ready to continue your journey?
            </p>
          </div>
          
          {/* Login Card */}
          <div className="glass-purple rounded-3xl shadow-2xl p-8 border border-purple-300/20">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2 font-poppins">
                  Email Address
                </label>
                <input 
                  id="email"
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-300/30 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2 font-poppins">
                  Password
                </label>
                <input 
                  id="password"
                  type="password" 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-300/30 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              
              <button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium font-poppins hover:from-purple-500 hover:to-pink-500 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <span className="flex items-center justify-center">
                      Sign In
                    </span>
                  )}
                </span>
              </button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-purple-200">
                Don't have an account?{' '}
                <Link 
                  to={`/signup/${role}`} 
                  className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300 hover:underline"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            <div className="text-center mt-4">
              <Link 
                to="/" 
                className="text-xs text-purple-300 hover:text-purple-200 transition-colors duration-300"
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
