import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { createApiUrl } from '../config/api'

export default function SignupDoctor() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    nic: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    district: '',
    qualifications: '',
    gender: '',
    languages: [] as string[],
    cv: null as File | null,
    license: null as File | null
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const specializations = [
    'Clinical Psychology', 'Psychiatry', 'Counseling Psychology', 'Child Psychology',
    'Neuropsychology', 'Forensic Psychology', 'Health Psychology', 'Family Therapy',
    'Cognitive Behavioral Therapy', 'Psychoanalysis', 'Social Work', 'Psychiatric Nursing'
  ]

  const sriLankanDistricts = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
    'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
    'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
    'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate all required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || 
        !formData.phone || !formData.nic || !formData.specialization || !formData.licenseNumber || 
        !formData.experience || !formData.district || !formData.qualifications || !formData.gender) {
      setError('Please fill in all required fields')
      return
    }

    // Validate languages selection
    if (formData.languages.length === 0) {
      setError('Please select at least one language')
      return
    }

    // Validate file uploads
    if (!formData.cv) {
      setError('Please upload your CV')
      return
    }

    if (!formData.license) {
      setError('Please upload your license document')
      return
    }

    setIsLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('firstName', formData.firstName)
      submitData.append('lastName', formData.lastName)
      submitData.append('email', formData.email)
      submitData.append('password', formData.password)
      submitData.append('phone', formData.phone)
      submitData.append('nic', formData.nic)
      submitData.append('specialization', formData.specialization)
      submitData.append('licenseNumber', formData.licenseNumber)
      submitData.append('experience', formData.experience)
      submitData.append('district', formData.district)
      submitData.append('qualifications', formData.qualifications)
      submitData.append('gender', formData.gender)
      submitData.append('languages', JSON.stringify(formData.languages))
      
      if (formData.cv) {
        submitData.append('cvFile', formData.cv)
      }
      if (formData.license) {
        submitData.append('licenseFile', formData.license)
      }

      await axios.post(createApiUrl('api/auth/doctor/signup'), submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Show success message and redirect after a delay
      setError('')
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">🩺</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">💊</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">🧬</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">⚕️</div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl w-full space-y-8 animate-fade-in-up">
          {/* Header Section */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                MindCare
              </h1>
            </div>
            <div className="text-2xl font-bold text-white mb-2 animate-fade-in">
              🩺 Join Our Medical Team
            </div>
            <p className="text-gray-300 animate-fade-in animation-delay-1000">
              Empower minds, transform lives
            </p>
          </div>
          
          {/* Registration Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-in-left">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  Registration successful! Your account is pending admin approval. You will be notified once approved.
                  <br />
                  <small className="text-green-400">Redirecting to home page in 3 seconds...</small>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset disabled={isLoading || isSuccess}>
              
              {/* Important Notice */}
              <div className="bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="mr-2">ℹ️</span>
                  <div>
                    <p className="font-medium">All fields marked with * are required</p>
                    <p className="text-sm text-blue-400">Please ensure all information is accurate and complete for approval</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    👨‍⚕️ First Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Your first name"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    👨‍⚕️ Last Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Your last name"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  📧 Email Address *
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="your.professional@email.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    🔒 Password *
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    🔐 Confirm Password *
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  📱 Phone Number *
                </label>
                <input 
                  type="tel" 
                  required
                  placeholder="+94 71 234 5678"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                />
              </div>

              {/* Professional Information */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
                  👨‍⚕️ Professional Details
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      🧠 Specialization *
                    </label>
                    <select 
                      required
                      value={formData.specialization}
                      onChange={e => setFormData({...formData, specialization: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                    >
                      <option value="" className="bg-gray-800">Select specialization</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec} className="bg-gray-800">
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      📜 License Number *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Professional license number"
                      value={formData.licenseNumber}
                      onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      📅 Years of Experience *
                    </label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      max="50"
                      placeholder="Years in practice"
                      value={formData.experience}
                      onChange={e => setFormData({...formData, experience: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      🏛️ District *
                    </label>
                    <select 
                      required
                      value={formData.district}
                      onChange={e => setFormData({...formData, district: e.target.value})}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                    >
                      <option value="" className="bg-gray-800">Select your district</option>
                      {sriLankanDistricts.map(district => (
                        <option key={district} value={district} className="bg-gray-800">
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="group mt-6">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    🎓 Qualifications *
                  </label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="List your educational qualifications and certifications"
                    value={formData.qualifications}
                    onChange={e => setFormData({...formData, qualifications: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25 resize-none"
                  />
                </div>

                {/* NIC Field */}
                <div className="group mt-6">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    🆔 NIC Number *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="National Identity Card Number"
                    value={formData.nic}
                    onChange={e => setFormData({...formData, nic: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                  />
                </div>

                {/* File Upload Section */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      📄 Upload CV *
                    </label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        required
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFormData({...formData, cv: file})
                          }
                        }}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500 file:text-white hover:file:bg-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                      />
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX files only (Required)</p>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      📜 Upload License *
                    </label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFormData({...formData, license: file})
                          }
                        }}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500 file:text-white hover:file:bg-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                      />
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG files only (Required)</p>
                    </div>
                  </div>
                </div>

                {/* Gender Field */}
                <div className="group mt-6">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    👤 Gender *
                  </label>
                  <select 
                    required
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
                  >
                    <option value="" className="bg-gray-800">Select your gender</option>
                    <option value="Male" className="bg-gray-800">Male</option>
                    <option value="Female" className="bg-gray-800">Female</option>
                    <option value="Other" className="bg-gray-800">Other</option>
                  </select>
                </div>

                {/* Languages Field */}
                <div className="group mt-6">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    🗣️ Languages Spoken *
                  </label>
                  <div className="space-y-2">
                    {['Sinhala', 'Tamil', 'English'].map(lang => (
                      <label key={lang} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={e => {
                            if (e.target.checked) {
                              setFormData({...formData, languages: [...formData.languages, lang]})
                            } else {
                              setFormData({...formData, languages: formData.languages.filter(l => l !== lang)})
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 bg-white/20 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <span className="text-gray-200">{lang}</span>
                      </label>
                    ))}
                    <p className="text-xs text-gray-400 mt-1">Please select at least one language (Required)</p>
                  </div>
                </div>
              </div>
              </fieldset>
              
              <button 
                type="submit"
                disabled={isLoading || isSuccess}
                className="group relative w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-400 hover:to-teal-500 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Profile...
                    </>
                  ) : isSuccess ? (
                    <>
                      <span className="mr-2">✅</span>
                      Registration Successful!
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🩺</span>
                      Join Medical Team
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </button>
            </form>
            
            <div className="text-center mt-6 animate-fade-in-up animation-delay-2000">
              <p className="text-sm text-gray-300">
                Already have an account?{' '}
                <Link 
                  to="/login/doctor" 
                  className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-300 hover:underline"
                >
                  🩺 Sign in here
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
