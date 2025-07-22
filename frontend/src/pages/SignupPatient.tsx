import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function SignupPatient() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', nic: '', gender: '', dob: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      setError('')
      setLoading(true)
      
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      
      if (!form.name || !form.email || !form.password || !form.nic) {
        setError('Please fill in all required fields')
        return
      }
      
      await axios.post('http://localhost:5000/auth/patient/signup', form)
      alert('🎉 Registration successful! Welcome to MindCare!')
      navigate('/login/patient')
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-fuchsia-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">🧠</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">💊</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">🌟</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">✨</div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl animate-fade-in-up">
          {/* Header Section */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                MindCare
              </h1>
            </div>
            <div className="text-2xl font-bold text-white mb-2 animate-fade-in">
              🧠 Patient Registration
            </div>
            <p className="text-gray-300 animate-fade-in animation-delay-1000">
              Begin your journey to mental wellness
            </p>
          </div>
          
          {/* Registration Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-in-left">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {['name', 'email', 'nic', 'dob', 'phone'].map((field, index) => (
                <div key={field} className="group animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                  <label className="block text-sm font-medium text-gray-200 mb-2 capitalize">
                    {field === 'nic' ? '🆔 NIC' : field === 'dob' ? '📅 Date of Birth' : field === 'name' ? '👤 Name' : field === 'email' ? '📧 Email' : '📱 Phone'} 
                    {['name', 'email', 'nic'].includes(field) && <span className="text-rose-400 ml-1">*</span>}
                  </label>
                  <input
                    name={field}
                    placeholder={`Enter your ${field === 'nic' ? 'NIC' : field === 'dob' ? 'date of birth' : field}`}
                    value={form[field as keyof typeof form]}
                    onChange={handleChange}
                    type={field === 'dob' ? 'date' : field === 'email' ? 'email' : 'text'}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                    required={['name', 'email', 'nic'].includes(field)}
                  />
                </div>
              ))}
              
              <div className="group animate-fade-in-up" style={{animationDelay: '500ms'}}>
                <label className="block text-sm font-medium text-gray-200 mb-2">⚧️ Gender</label>
                <select 
                  name="gender" 
                  value={form.gender} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                >
                  <option value="" className="bg-gray-800">Select Gender</option>
                  <option value="male" className="bg-gray-800">Male</option>
                  <option value="female" className="bg-gray-800">Female</option>
                  <option value="other" className="bg-gray-800">Other</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {['password', 'confirmPassword'].map((field, index) => (
                <div key={field} className="group animate-fade-in-up" style={{animationDelay: `${600 + index * 100}ms`}}>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    🔒 {field === 'confirmPassword' ? 'Confirm Password' : 'Password'} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    name={field}
                    placeholder={`Enter your ${field === 'confirmPassword' ? 'password again' : 'password'}`}
                    value={form[field as keyof typeof form]}
                    onChange={handleChange}
                    type="password"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                    required
                  />
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-rose-400 hover:to-purple-500 focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in-up animation-delay-1000"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    Create Account
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </button>
            
            <div className="text-center mt-6 animate-fade-in-up animation-delay-2000">
              <p className="text-sm text-gray-300">
                Already have an account?{' '}
                <Link 
                  to="/login/patient" 
                  className="font-medium text-rose-400 hover:text-rose-300 transition-colors duration-300 hover:underline"
                >
                  ✨ Sign in here
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
