import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function SignupPatientSoftMinimalist() {
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
      alert('Registration successful! Welcome to MindCare!')
      navigate('/login/patient')
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen soft-patient-bg relative overflow-hidden font-inter">
      {/* Gentle Background Elements */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full animate-gentleFloat opacity-30 filter blur-xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-200 rounded-full animate-gentleFloat opacity-30 filter blur-xl" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-indigo-200 rounded-full animate-gentleFloat opacity-30 filter blur-xl" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-2">
                MindCare
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-slate-700 mb-2">
              Patient Registration
            </div>
            <p className="text-slate-600">
              Begin your journey to mental wellness with our caring community
            </p>
          </div>
          
          {/* Registration Card */}
          <div className="soft-glass rounded-3xl shadow-xl p-8 border border-white/30">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {['name', 'email', 'nic', 'dob', 'phone'].map((field, index) => (
                <div key={field} className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                    {field === 'nic' ? 'NIC' : field === 'dob' ? 'Date of Birth' : field === 'name' ? 'Full Name' : field === 'email' ? 'Email Address' : 'Phone Number'} 
                    {['name', 'email', 'nic'].includes(field) && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    name={field}
                    placeholder={`Enter your ${field === 'nic' ? 'NIC number' : field === 'dob' ? 'date of birth' : field}`}
                    value={form[field as keyof typeof form]}
                    onChange={handleChange}
                    type={field === 'dob' ? 'date' : field === 'email' ? 'email' : 'text'}
                    className="soft-input w-full"
                    required={['name', 'email', 'nic'].includes(field)}
                  />
                </div>
              ))}
              
              <div className="group">
                <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                <select 
                  name="gender" 
                  value={form.gender} 
                  onChange={handleChange} 
                  className="soft-input w-full"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {['password', 'confirmPassword'].map((field) => (
                <div key={field} className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {field === 'confirmPassword' ? 'Confirm Password' : 'Password'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name={field}
                    placeholder={`${field === 'confirmPassword' ? 'Confirm your password' : 'Create a secure password'}`}
                    value={form[field as keyof typeof form]}
                    onChange={handleChange}
                    type="password"
                    className="soft-input w-full"
                    required
                  />
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="soft-button w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Your Account...
                </span>
              ) : (
                'Create My Account'
              )}
            </button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link 
                  to="/login/patient" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="text-center mt-4">
              <Link 
                to="/" 
                className="text-xs text-slate-500 hover:text-slate-600 transition-colors duration-300"
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
