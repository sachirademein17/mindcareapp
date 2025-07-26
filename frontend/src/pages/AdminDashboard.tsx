
import { useEffect, useState } from 'react'
import axios from 'axios'
import { createApiUrl } from '../config/api'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [activeTab, setActiveTab] = useState('doctors')

  const token = localStorage.getItem('token')

  const fetchUsers = async () => {
    try {
      const res = await axios.get(createApiUrl('admin/users'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('❌ Failed to fetch users. Please check your connection and try again.')
    }
  }

  const approveDoctor = async (id: string) => {
    try {
      await axios.put(createApiUrl(`admin/approve-doctor/${id}`), {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('✅ Doctor approved successfully!')
      fetchUsers()
      setShowDoctorModal(false)
    } catch (error) {
      console.error('Error approving doctor:', error)
      alert('❌ Failed to approve doctor')
    }
  }

  const deleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(createApiUrl(`admin/user/${id}`), {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('✅ User deleted successfully!')
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('❌ Failed to delete user')
      }
    }
  }

  const viewDoctorDetails = (doctor: any) => {
    setSelectedDoctor(doctor)
    setShowDoctorModal(true)
  }

  const doctors = users.filter((user: any) => user.role === 'doctor')
  const patients = users.filter((user: any) => user.role === 'patient')
  const pendingDoctors = doctors.filter((doctor: any) => !doctor.DoctorDetail?.approved)
  const approvedDoctors = doctors.filter((doctor: any) => doctor.DoctorDetail?.approved)

  useEffect(() => {
    fetchUsers()
  }, [])

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
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">👑</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">⚕️</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">👨‍⚕️</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">👩‍⚕️</div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            👑 Admin Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Manage doctors, patients, and system operations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 mr-2 ${
                activeTab === 'doctors'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              👨‍⚕️ Doctors ({doctors.length})
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'patients'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🧠 Patients ({patients.length})
            </button>
          </div>
        </div>

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Pending Doctors Section */}
            {pendingDoctors.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-orange-400/30">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  ⏳ Pending Doctor Approvals ({pendingDoctors.length})
                </h2>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {pendingDoctors.map((doctor: any, index: number) => (
                    <div 
                      key={doctor.id} 
                      className="bg-orange-500/20 border border-orange-400/30 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-orange-500/30 animate-fade-in-up"
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-white font-semibold">{doctor.name}</h3>
                          <p className="text-gray-300 text-sm">{doctor.email}</p>
                        </div>
                      </div>
                      
                      {doctor.DoctorDetail && (
                        <div className="mb-4 space-y-2">
                          <p className="text-gray-300 text-sm">
                            🏥 {doctor.DoctorDetail.specialization}
                          </p>
                          <p className="text-gray-300 text-sm">
                            👤 {doctor.DoctorDetail.gender}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewDoctorDetails(doctor)}
                          className="flex-1 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          📋 Review Details
                        </button>
                        <button
                          onClick={() => approveDoctor(doctor.id)}
                          className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => deleteUser(doctor.id)}
                          className="bg-red-500 hover:bg-red-400 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Doctors Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-green-400/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                ✅ Approved Doctors ({approvedDoctors.length})
              </h2>
              {approvedDoctors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👨‍⚕️</div>
                  <p className="text-gray-300 text-lg">No approved doctors yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {approvedDoctors.map((doctor: any, index: number) => (
                    <div 
                      key={doctor.id} 
                      className="bg-green-500/20 border border-green-400/30 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-green-500/30 animate-fade-in-up"
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-white font-semibold">{doctor.name}</h3>
                          <p className="text-gray-300 text-sm">{doctor.email}</p>
                        </div>
                      </div>
                      
                      {doctor.DoctorDetail && (
                        <div className="mb-4 space-y-2">
                          <p className="text-gray-300 text-sm">
                            🏥 {doctor.DoctorDetail.specialization}
                          </p>
                          <p className="text-gray-300 text-sm">
                            👤 {doctor.DoctorDetail.gender}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewDoctorDetails(doctor)}
                          className="flex-1 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          📋 View Details
                        </button>
                        <button
                          onClick={() => deleteUser(doctor.id)}
                          className="bg-red-500 hover:bg-red-400 text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-blue-400/30 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              🧠 Registered Patients ({patients.length})
            </h2>
            {patients.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧠</div>
                <p className="text-gray-300 text-lg">No registered patients yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient: any, index: number) => (
                  <div 
                    key={patient.id} 
                    className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-blue-500/30 animate-fade-in-up"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-white font-semibold">{patient.name}</h3>
                        <p className="text-gray-300 text-sm">{patient.email}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-300 text-sm">
                        📅 Joined: {new Date(patient.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteUser(patient.id)}
                        className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Doctor Details Modal */}
        {showDoctorModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-white">👨‍⚕️ Doctor Details</h3>
                  <button
                    onClick={() => setShowDoctorModal(false)}
                    className="text-gray-400 hover:text-white transition-colors text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      👤 Basic Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-sm">Full Name</label>
                        <p className="text-white font-medium">{selectedDoctor.name}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Email</label>
                        <p className="text-white font-medium">{selectedDoctor.email}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Registration Date</label>
                        <p className="text-white font-medium">
                          {new Date(selectedDoctor.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  {selectedDoctor.DoctorDetail && (
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        🏥 Professional Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-sm">Specialization</label>
                          <p className="text-white font-medium">{selectedDoctor.DoctorDetail.specialization}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">License Number</label>
                          <p className="text-white font-medium">{selectedDoctor.DoctorDetail.licenseNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Gender</label>
                          <p className="text-white font-medium">{selectedDoctor.DoctorDetail.gender}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Languages</label>
                          <p className="text-white font-medium">
                            {(() => {
                              try {
                                const languages = JSON.parse(selectedDoctor.DoctorDetail.languages)
                                return Array.isArray(languages) ? languages.join(', ') : selectedDoctor.DoctorDetail.languages
                              } catch {
                                return selectedDoctor.DoctorDetail.languages
                              }
                            })()}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Location</label>
                          <p className="text-white font-medium">{selectedDoctor.DoctorDetail.location || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Experience & Qualifications */}
                  {selectedDoctor.DoctorDetail && (
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 md:col-span-2">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        🎓 Experience & Qualifications
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-sm">Years of Experience</label>
                          <p className="text-white font-medium">{selectedDoctor.DoctorDetail.experience || 'Not provided'} years</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Qualifications</label>
                          <p className="text-white font-medium">{selectedDoctor.DoctorDetail.qualifications || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      {selectedDoctor.DoctorDetail.bio && (
                        <div className="mt-4">
                          <label className="text-gray-400 text-sm">Biography</label>
                          <p className="text-white font-medium mt-2 leading-relaxed">
                            {selectedDoctor.DoctorDetail.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CV and License Documents */}
                  {selectedDoctor.DoctorDetail && (
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 md:col-span-2">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        📄 Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-sm">Curriculum Vitae (CV)</label>
                          {selectedDoctor.DoctorDetail.cvPath ? (
                            <div className="mt-2">
                              <a
                                href={`http://localhost:5000/uploads/${selectedDoctor.DoctorDetail.cvPath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm"
                              >
                                📄 View CV
                              </a>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm mt-2">No CV uploaded</p>
                          )}
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Medical License</label>
                          {selectedDoctor.DoctorDetail.licensePath ? (
                            <div className="mt-2">
                              <a
                                href={`http://localhost:5000/uploads/${selectedDoctor.DoctorDetail.licensePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm"
                              >
                                📜 View License
                              </a>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm mt-2">No license uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!selectedDoctor.DoctorDetail?.approved && (
                  <div className="flex gap-4 mt-8 justify-end">
                    <button
                      onClick={() => setShowDoctorModal(false)}
                      className="bg-gray-500 hover:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => approveDoctor(selectedDoctor.id)}
                      className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      ✅ Approve Doctor
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
