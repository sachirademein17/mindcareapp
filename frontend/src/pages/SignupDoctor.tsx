import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      alert('Signup successful! Await admin approval.')
      navigate('/login')
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.error || 'Signup failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100">
      <form
        className="bg-white shadow-xl rounded-lg px-10 py-8 w-full max-w-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Doctor Signup</h2>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full mb-4 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full mb-4 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          name="nic"
          placeholder="NIC Number"
          value={formData.nic}
          onChange={handleChange}
          required
          className="w-full mb-4 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full mb-4 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />
        {errors.password && <p className="text-red-500 text-sm mb-4">{errors.password}</p>}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full mb-4 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mb-4">{errors.confirmPassword}</p>}

        <input
          type="text"
          name="specialization"
          placeholder="Specialization (e.g., Clinical Psychology, Psychiatry)"
          value={formData.specialization}
          onChange={handleChange}
          required
          className="w-full mb-4 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          className="w-full mb-4 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          type="text"
          name="location"
          placeholder="Location (e.g., Colombo, Kandy, Galle)"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full mb-4 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Languages (Select one or more):
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['English', 'Sinhala', 'Tamil'].map((language) => (
              <label key={language} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(language)}
                  onChange={() => handleLanguageChange(language)}
                  className="mr-2"
                />
                <span className="text-sm">{language}</span>
              </label>
            ))}
          </div>
          {errors.languages && <p className="text-red-500 text-sm mt-2">{errors.languages}</p>}
        </div>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
          required
          className="w-full mb-2 p-2 border rounded-lg bg-white shadow-sm"
        />
        <p className="text-xs text-gray-500 mb-4">Upload your CV (PDF format only)</p>
        {errors.cv && <p className="text-red-500 text-sm mb-4">{errors.cv}</p>}

        {errors.submit && <p className="text-red-500 text-sm mb-4">{errors.submit}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
            loading 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Signing up...' : 'Signup'}
        </button>
      </form>
    </div>
  )
}
