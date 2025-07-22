import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Chat from '../common/Chat'

const DoctorChat = () => {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovedPatients()
  }, [])

  const fetchApprovedPatients = () => {
    axios.get('http://localhost:5000/doctor/enrollments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      setPatients(res.data)
      // Auto-select first patient if available
      if (res.data.length > 0) {
        setSelectedPatient(res.data[0])
      }
      setLoading(false)
    })
      .catch(err => {
        console.error('Error fetching patients:', err)
        setLoading(false)
      })
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

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">💬</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">🩺</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">👥</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">⚕️</div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <Link 
            to="/doctor/dashboard" 
            className="inline-flex items-center text-emerald-300 hover:text-emerald-200 transition-colors duration-300 mb-4 group"
          >
            <span className="mr-2 group-hover:translate-x-[-4px] transition-transform duration-300">←</span>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Chat with Patients
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in animation-delay-1000">
            💬 Connect securely with your patients and provide support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20 animate-slide-in-left">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                👥 Your Patients
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading patients...</p>
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-gray-300 mb-4">No enrolled patients yet.</p>
                  <p className="text-gray-400 text-sm">
                    Patients will appear here after they enroll and you approve them.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patients.map((patient: any, index: number) => (
                    <div 
                      key={patient.Patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 animate-fade-in-up ${
                        selectedPatient?.Patient.id === patient.Patient.id 
                          ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-2 border-emerald-400/50 shadow-lg' 
                          : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-emerald-400/30'
                      }`}
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🧑‍🦱</span>
                        <div>
                          <h3 className="font-semibold text-white">{patient.Patient.name}</h3>
                          <p className="text-sm text-emerald-300">{patient.Patient.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Enrolled: {new Date(patient.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            <span className="text-xs text-green-300">Active Patient</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 animate-slide-in-right">
              {selectedPatient ? (
                <div>
                  <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-6 rounded-t-3xl border-b border-white/20">
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">🧑‍🦱</span>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Chat with {selectedPatient.Patient.name}
                        </h2>
                        <p className="text-emerald-300 text-sm">
                          {selectedPatient.Patient.email}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Patient since: {new Date(selectedPatient.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                                    <Chat 
                    key={selectedPatient.Patient.id} 
                    receiverId={selectedPatient.Patient.id.toString()} 
                  />
                </div>
              ) : (
                <div className="p-8 text-center animate-fade-in">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Welcome to Patient Chat
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Select a patient from the list to start chatting
                  </p>
                  <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 rounded-xl p-4">
                    <p className="text-emerald-300 text-sm">
                      💡 Tip: All conversations are secure, confidential, and HIPAA compliant
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorChat
