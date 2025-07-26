import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  nic: string
  phoneNumber: string
  gender: string
  dateOfBirth: string
  emergencyContactName: string
  emergencyPhone: string
}

const SignupPatient: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    nic: '',
    phoneNumber: '',
    // age removed
    gender: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyPhone: ''
  })
  const [error, setError] = useState<string>('')
  const [nicError, setNicError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')

  const validateNIC = (nic: string): boolean => {
    const oldNICPattern = /^\d{9}[vVxX]$/
    const newNICPattern = /^\d{12}$/
    
    if (!oldNICPattern.test(nic) && !newNICPattern.test(nic)) {
      setNicError('Please enter a valid NIC number (9 digits + V/X or 12 digits)')
      return false
    }
    
    setNicError('')
    return true
  }

  const validatePassword = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'nic') {
      validateNIC(value)
    }
    
    // Validate passwords when either password field changes
    if (name === 'password' || name === 'confirmPassword') {
      // Use setTimeout to ensure state is updated before validation
      setTimeout(() => {
        const updatedData = { ...formData, [name]: value }
        if (updatedData.password && updatedData.confirmPassword) {
          if (updatedData.password !== updatedData.confirmPassword) {
            setPasswordError('Passwords do not match')
          } else if (updatedData.password.length < 6) {
            setPasswordError('Password must be at least 6 characters long')
          } else {
            setPasswordError('')
          }
        } else {
          setPasswordError('')
        }
      }, 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateNIC(formData.nic)) {
      return
    }

    if (!validatePassword()) {
      return
    }

    try {
      // Prepare data to match backend expectations
      const requestData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        nic: formData.nic,
        gender: formData.gender,
        dob: formData.dateOfBirth,
        phone: formData.phoneNumber,
        emergencyContactName: formData.emergencyContactName,
        emergencyPhone: formData.emergencyPhone
      }

      console.log('Sending registration request:', requestData) // Debug log

      const response = await fetch('http://localhost:5000/api/auth/patient/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        navigate('/login/patient')
      } else {
        const errorData = await response.json()
        console.error('Registration error response:', errorData) // Debug log
        setError(errorData.error || errorData.message || 'Registration failed')
      }
    } catch (error: unknown) {
      console.error('Registration error:', error)
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">🧠</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">💜</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">🌟</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">✨</div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl w-full space-y-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
                MindCare Platform
              </h1>
            </div>
            <div className="text-2xl font-bold text-white mb-2 animate-fade-in">
              👤 Patient Registration
            </div>
            <p className="text-purple-200 animate-fade-in animation-delay-1000">
              Join our community for mental health support
            </p>
          </div>

          {/* Main Form Card with Glassmorphism */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-purple-500/20 hover:shadow-2xl transition-all duration-300 animate-fade-in-up animation-delay-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent mb-3 animate-fade-in">
                👤 Patient Registration
              </h2>
              <p className="text-purple-200/80 animate-fade-in animation-delay-1000">Create your patient account with us</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-300/30 rounded-xl">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-purple-300 mb-6 flex items-center gap-2">
                  <span className="text-2xl">👤</span>{' '}
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="firstName" className="block text-sm font-medium text-purple-200 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="group">
                    <label htmlFor="lastName" className="block text-sm font-medium text-purple-200 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* NIC Field */}
                <div className="group mt-6">
                  <label htmlFor="nic" className="block text-sm font-medium text-purple-200 mb-2">
                    🆔 National Identity Card (NIC)
                  </label>
                  <input
                    type="text"
                    id="nic"
                    name="nic"
                    value={formData.nic}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                    placeholder="Enter your NIC number (e.g., 123456789V or 123456789012)"
                  />
                  <p className="text-xs text-purple-300 mt-1">
                    Format: 9 digits + V/X (old) or 12 digits (new)
                  </p>
                  {nicError && (
                    <p className="text-red-300 text-sm mt-2">{nicError}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                      📧 Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="group">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-purple-200 mb-2">
                      📞 Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                      placeholder="+94 XX XXX XXXX"
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="group">
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-purple-200 mb-2">
                      🎂 Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                    />
                  </div>

                  <div className="group">
                    <label htmlFor="gender" className="block text-sm font-medium text-purple-200 mb-2">
                      👥 Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                    >
                      <option value="" className="bg-purple-900">Select gender</option>
                      <option value="male" className="bg-purple-900">Male</option>
                      <option value="female" className="bg-purple-900">Female</option>
                      <option value="other" className="bg-purple-900">Other</option>
                      <option value="prefer-not-to-say" className="bg-purple-900">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div className="group mt-6">
                  <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                    🔒 Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                    placeholder="Create a strong password"
                    minLength={6}
                  />
                </div>

                {/* Confirm Password */}
                <div className="group mt-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
                    🔒 Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                    placeholder="Confirm your password"
                    minLength={6}
                  />
                  {passwordError && (
                    <p className="text-red-300 text-sm mt-2">{passwordError}</p>
                  )}
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-purple-300 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🚨</span>{' '}
                  Emergency Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="emergencyContactName" className="block text-sm font-medium text-purple-200 mb-2">
                      👤 Contact Name
                    </label>
                    <input
                      type="text"
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                      placeholder="Emergency contact name"
                    />
                  </div>

                  <div className="group">
                    <label htmlFor="emergencyPhone" className="block text-sm font-medium text-purple-200 mb-2">
                      📞 Contact Phone
                    </label>
                    <input
                      type="tel"
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-white/15"
                      placeholder="+94 XX XXX XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 backdrop-blur-sm border border-white/20"
              >
                🚀 Create Patient Account
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-purple-200">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login/patient')}
                    className="text-white font-semibold hover:text-purple-200 underline hover:no-underline transition-all duration-200"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPatient
