import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

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
      
      const response = await axios.post('http://localhost:5000/auth/patient/signup', form)
      alert('Registered successfully!')
      navigate('/login/patient')
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Patient Registration</h2>
          <p className="mt-2 text-sm text-gray-600">Create your patient account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {['name', 'email', 'nic', 'dob', 'phone'].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {field === 'nic' ? 'NIC' : field === 'dob' ? 'Date of Birth' : field} {['name', 'email', 'nic'].includes(field) && '*'}
              </label>
              <input
                name={field}
                placeholder={`Enter your ${field === 'nic' ? 'NIC' : field === 'dob' ? 'date of birth' : field}`}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                type={field === 'dob' ? 'date' : field === 'email' ? 'email' : 'text'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required={['name', 'email', 'nic'].includes(field)}
              />
            </div>
          ))}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select 
              name="gender" 
              value={form.gender} 
              onChange={handleChange} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {['password', 'confirmPassword'].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field === 'confirmPassword' ? 'Confirm Password' : 'Password'} *
              </label>
              <input
                name={field}
                placeholder={`Enter your ${field === 'confirmPassword' ? 'password again' : 'password'}`}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login/patient" className="font-medium text-green-600 hover:text-green-500">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
