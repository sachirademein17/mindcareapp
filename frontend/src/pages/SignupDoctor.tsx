import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function SignupDoctor() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    nic: '',
    specialization: '',
    gender: 'male',
    location: '',
    languages: [] as string[]
  })
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handleLanguageChange = (language: string) => {
    const updatedLanguages = formData.languages.includes(language)
      ? formData.languages.filter(lang => lang !== language)
      : [...formData.languages, language]
    
    setFormData({ ...formData, languages: updatedLanguages })
    if (errors.languages) {
      setErrors(prev => ({ ...prev, languages: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.languages.length === 0) {
      newErrors.languages = 'Please select at least one language'
    }
    
    if (!cvFile) {
      newErrors.cv = 'Please upload your CV'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setErrors({})
    
    const payload = new FormData()
    payload.append('fullName', formData.fullName)
    payload.append('email', formData.email)
    payload.append('password', formData.password)
    payload.append('nic', formData.nic)
    payload.append('specialization', formData.specialization)
    payload.append('gender', formData.gender)
    payload.append('location', formData.location)
    payload.append('languages', JSON.stringify(formData.languages))
    if (cvFile) payload.append('cv', cvFile)

    try {
      await axios.post('http://localhost:5000/auth/doctor/signup', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Signup successful! Please await admin approval.')
      navigate('/login/doctor')
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.error || 'Signup failed' })
    } finally {
      setLoading(false)
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-extrabold font-poppins gradient-text hover:scale-105 transform transition-all duration-300">
                MindCare
              </h1>
            </div>
            <div className="text-2xl font-bold text-white mb-2 font-poppins">
              Doctor Registration
            </div>
            <p className="text-purple-200">
              Join our platform to help heal minds and change lives
            </p>
          </div>
          
          {/* Registration Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-in-left"
          >
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {errors.submit}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { name: 'fullName', icon: '👤', label: 'Full Name', type: 'text' },
                { name: 'email', icon: '📧', label: 'Email', type: 'email' },
                { name: 'nic', icon: '🆔', label: 'NIC Number', type: 'text' },
                { name: 'specialization', icon: '🧠', label: 'Specialization', type: 'text' },
              ].map((field, index) => (
                <div key={field.name} className="group animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {field.label} <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                  />
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                📍 Location <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                name="location"
                placeholder="Enter your location (e.g., Colombo, Kandy, Galle)"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/25"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                ⚧️ Gender <span className="text-emerald-400">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/25"
              >
                <option value="male" className="bg-gray-800">Male</option>
                <option value="female" className="bg-gray-800">Female</option>
                <option value="other" className="bg-gray-800">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {['password', 'confirmPassword'].map((field, index) => (
                <div key={field} className="group animate-fade-in-up" style={{animationDelay: `${600 + index * 100}ms`}}>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {field === 'confirmPassword' ? 'Confirm Password' : 'Password'} <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="password"
                    name={field}
                    placeholder={`Enter your ${field === 'confirmPassword' ? 'password again' : 'password'}`}
                    value={formData[field as keyof typeof formData] as string}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                  />
                  {errors[field] && <p className="text-red-300 text-sm mt-1">{errors[field]}</p>}
                </div>
              ))}
            </div>

            <div className="mb-6 animate-fade-in-up animation-delay-800">
              <label className="block text-sm font-medium text-gray-200 mb-3">
                🌐 Languages (Select one or more) <span className="text-emerald-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['English', 'Sinhala', 'Tamil'].map((language) => (
                  <label key={language} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(language)}
                      onChange={() => handleLanguageChange(language)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 mr-3 transition-all duration-300 ${
                      formData.languages.includes(language) 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-white/30 group-hover:border-emerald-400'
                    }`}>
                      {formData.languages.includes(language) && (
                        <div className="text-white text-center text-xs leading-5">✓</div>
                      )}
                    </div>
                    <span className="text-white text-sm group-hover:text-emerald-300 transition-colors duration-300">
                      {language}
                    </span>
                  </label>
                ))}
              </div>
              {errors.languages && <p className="text-red-300 text-sm mt-2">{errors.languages}</p>}
            </div>

            <div className="mb-6 animate-fade-in-up animation-delay-900">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                📄 Upload CV (PDF only) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500 file:text-white hover:file:bg-emerald-400 transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                />
                {cvFile && (
                  <div className="mt-2 text-emerald-300 text-sm">
                    📎 {cvFile.name}
                  </div>
                )}
              </div>
              {errors.cv && <p className="text-red-300 text-sm mt-1">{errors.cv}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-400 hover:to-cyan-500 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in-up animation-delay-1000"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <span className="mr-2">Sign Up</span>
                    Submit Application
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </button>

            <div className="text-center mt-6 animate-fade-in-up animation-delay-2000">
              <p className="text-sm text-gray-300">
                Already have an account?{' '}
                <Link 
                  to="/login/doctor" 
                  className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-300 hover:underline"
                >
                  Sign in here
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
          </form>
        </div>
      </div>
    </div>
  )
}
