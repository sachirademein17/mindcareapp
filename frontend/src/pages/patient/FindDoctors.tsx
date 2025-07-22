import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const FindDoctors = () => {
  const [location, setLocation] = useState('')
  const [language, setLanguage] = useState('')
  const [doctors, setDoctors] = useState([])
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<{[key: string]: string}>({})
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (location) params.append('location', location)
      if (language) params.append('language', language)
      
      const res = await axios.get(`http://localhost:5000/patient/filter-doctors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setDoctors(res.data)
      
      // Check enrollment status for each doctor
      await checkEnrollmentStatuses(res.data)
    } catch (error) {
      console.error('Error searching doctors:', error)
      alert('❌ Failed to search doctors')
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollmentStatuses = async (doctorsList: any[]) => {
    const statuses: {[key: string]: string} = {}
    for (const doctor of doctorsList) {
      try {
        const res = await axios.get(`http://localhost:5000/patient/enrollment-status/${doctor.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        statuses[doctor.id] = res.data.status
      } catch (error) {
        // No enrollment exists, so status is null
        statuses[doctor.id] = 'none'
      }
    }
    setEnrollmentStatuses(statuses)
  }

  const handleEnroll = async (doctorId: string) => {
    try {
      const response = await axios.post(`http://localhost:5000/patient/enroll/${doctorId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('🎉 Enrollment request sent successfully!')
      console.log('Enrollment response:', response.data)
      
      // Update enrollment status
      setEnrollmentStatuses(prev => ({ ...prev, [doctorId]: 'pending' }))
    } catch (error: any) {
      console.error('Error enrolling doctor:', error)
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data.error || error.response.data.message || 'Unknown server error'
        if (errorMessage.includes('Already enrolled or pending')) {
          alert('You already have an enrollment request with this doctor (pending approval) or are already enrolled.')
        } else {
          alert(`Failed to send enrollment request: ${errorMessage}`)
        }
      } else if (error.request) {
        // Request was made but no response received
        alert('Failed to send enrollment request: No response from server. Please check if the server is running.')
      } else {
        // Something else happened
        alert(`Failed to send enrollment request: ${error.message}`)
      }
    }
  }

  const handleCancelEnrollment = async (doctorId: string) => {
    try {
      const response = await axios.delete(`http://localhost:5000/patient/cancel-enrollment/${doctorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('Enrollment request cancelled successfully!')
      console.log('Cancellation response:', response.data)
      
      // Update enrollment status
      setEnrollmentStatuses(prev => ({ ...prev, [doctorId]: 'none' }))
    } catch (error: any) {
      console.error('Error cancelling enrollment:', error)
      if (error.response) {
        alert(`Failed to cancel enrollment: ${error.response.data.error || error.response.data.message || 'Unknown server error'}`)
      } else {
        alert(`Failed to cancel enrollment: ${error.message}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">🔍</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">👨‍⚕️</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">🩺</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">💫</div>
      </div>

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <Link 
            to="/patient/dashboard" 
            className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-300 mb-4 group"
          >
            <span className="mr-2 group-hover:translate-x-[-4px] transition-transform duration-300">←</span>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Find Mental Health Doctors
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in animation-delay-1000">
            🔍 Discover qualified professionals who can help you on your wellness journey
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 mb-8 animate-slide-in-left">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            🎯 Search Filters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group animate-fade-in-up">
              <label className="block text-sm font-medium text-gray-200 mb-3">
                📍 Location
              </label>
              <select 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
              >
                <option value="" className="bg-gray-800">All Locations</option>
                <option value="Colombo" className="bg-gray-800">Colombo</option>
                <option value="Kandy" className="bg-gray-800">Kandy</option>
                <option value="Galle" className="bg-gray-800">Galle</option>
                <option value="Jaffna" className="bg-gray-800">Jaffna</option>
                <option value="Negombo" className="bg-gray-800">Negombo</option>
                <option value="Matara" className="bg-gray-800">Matara</option>
                <option value="Kurunegala" className="bg-gray-800">Kurunegala</option>
                <option value="Anuradhapura" className="bg-gray-800">Anuradhapura</option>
              </select>
            </div>

            <div className="group animate-fade-in-up animation-delay-200">
              <label className="block text-sm font-medium text-gray-200 mb-3">
                🌐 Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/25"
              >
                <option value="" className="bg-gray-800">All Languages</option>
                <option value="English" className="bg-gray-800">English</option>
                <option value="Sinhala" className="bg-gray-800">Sinhala</option>
                <option value="Tamil" className="bg-gray-800">Tamil</option>
              </select>
            </div>

            <div className="flex items-end animate-fade-in-up animation-delay-400">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔍</span>
                    Search Doctors
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-in-right">
          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">🔍</div>
              <p className="text-gray-300 text-lg">No doctors found yet.</p>
              <p className="text-gray-400 text-sm mt-2">Use the search filters above to find mental health professionals.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                👨‍⚕️ Available Doctors ({doctors.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doc: any, index: number) => (
                  <div 
                    key={doc.id} 
                    className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-4">👨‍⚕️</span>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{doc.name}</h3>
                        <p className="text-blue-300 text-sm">📧 {doc.email}</p>
                      </div>
                    </div>
                    
                    {doc.DoctorDetail && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-300 text-sm">
                          <span className="mr-2">🧠</span>
                          <span className="font-medium">Specialization:</span>
                          <span className="ml-2">{doc.DoctorDetail.specialization}</span>
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <span className="mr-2">⚧️</span>
                          <span className="font-medium">Gender:</span>
                          <span className="ml-2 capitalize">{doc.DoctorDetail.gender}</span>
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <span className="mr-2">📍</span>
                          <span className="font-medium">Location:</span>
                          <span className="ml-2">{doc.DoctorDetail.location}</span>
                        </div>
                        <div className="flex items-start text-gray-300 text-sm">
                          <span className="mr-2 mt-0.5">🌐</span>
                          <span className="font-medium">Languages:</span>
                          <span className="ml-2">{
                            (() => {
                              try {
                                const languages = JSON.parse(doc.DoctorDetail.languages)
                                return Array.isArray(languages) ? languages.join(', ') : doc.DoctorDetail.languages
                              } catch {
                                return doc.DoctorDetail.languages
                              }
                            })()
                          }</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      {(() => {
                        const status = enrollmentStatuses[doc.id]
                        if (status === 'approved') {
                          return (
                            <span className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center">
                              <span className="mr-2">✅</span>
                              Enrolled
                            </span>
                          )
                        } else if (status === 'pending') {
                          return (
                            <div className="flex gap-2">
                              <span className="bg-yellow-500 text-black px-4 py-2 rounded-xl text-sm font-medium flex items-center">
                                <span className="mr-2">⏳</span>
                                Pending
                              </span>
                              <button 
                                onClick={() => handleCancelEnrollment(doc.id)} 
                                className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center"
                              >
                                <span className="mr-2">❌</span>
                                Cancel
                              </button>
                            </div>
                          )
                        } else {
                          return (
                            <button 
                              onClick={() => handleEnroll(doc.id)} 
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                            >
                              <span className="mr-2">🚀</span>
                              Enroll
                            </button>
                          )
                        }
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FindDoctors
