import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import MeetingCalendar from '../common/MeetingCalendar'

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([])
  const [pendingEnrollments, setPendingEnrollments] = useState([])
  const [notes, setNotes] = useState('')
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [doctorId, setDoctorId] = useState<number>(0)

  useEffect(() => {
    // Get doctor ID from localStorage
    const userId = localStorage.getItem('userId')
    if (userId) {
      setDoctorId(parseInt(userId))
    }
    
    fetchApprovedEnrollments()
    fetchPendingEnrollments()
  }, [])

  const fetchApprovedEnrollments = () => {
    axios.get('http://localhost:5000/doctor/enrollments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setPatients(res.data))
      .catch(err => console.error('Error fetching patients:', err))
  }

  const fetchPendingEnrollments = () => {
    axios.get('http://localhost:5000/doctor/pending-enrollments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setPendingEnrollments(res.data))
      .catch(err => console.error('Error fetching pending enrollments:', err))
  }

  const handleApproveEnrollment = async (enrollmentId: number) => {
    try {
      await axios.patch(`http://localhost:5000/doctor/enrollment/${enrollmentId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('✅ Enrollment approved!')
      fetchPendingEnrollments()
      fetchApprovedEnrollments()
    } catch (err) {
      console.error('Error approving enrollment:', err)
      alert('Failed to approve enrollment')
    }
  }

  const handleRejectEnrollment = async (enrollmentId: number) => {
    try {
      await axios.patch(`http://localhost:5000/doctor/enrollment/${enrollmentId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('❌ Enrollment rejected!')
      fetchPendingEnrollments()
    } catch (err) {
      console.error('Error rejecting enrollment:', err)
      alert('Failed to reject enrollment')
    }
  }

  const handlePrescribe = async () => {
    if (!selectedEnrollment) return
    try {
      await axios.post('http://localhost:5000/doctor/prescription', {
        enrollmentId: selectedEnrollment,
        notes
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('💊 Prescription Issued Successfully!')
      setNotes('')
    } catch (err) {
      console.error('Error issuing prescription:', err)
      alert('Failed to issue prescription')
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

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Removed floating emojis for cleaner design */}
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold font-poppins gradient-text mb-4 hover:scale-105 transform transition-all duration-300">
            Doctor Dashboard
          </h1>
          <p className="text-purple-200 text-lg">
            Healing minds, changing lives, one patient at a time
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8 animate-fade-in-up">
          <Link 
            to="/doctor/chat" 
            className="group bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-8 py-4 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl inline-flex items-center"
          >
            <span className="text-3xl mr-3 group-hover:animate-bounce">💬</span>
            <div>
              <div className="font-semibold text-lg">Chat with Patients</div>
              <div className="text-purple-100 text-sm">Secure communication platform</div>
            </div>
          </Link>
        </div>

        {/* Meeting Calendar Section */}
        <div className="mb-8 animate-slide-in-left">
          <MeetingCalendar userId={doctorId} enrollments={patients} />
        </div>
        
        {/* Pending Enrollment Requests */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 mb-8 animate-slide-in-right">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            ⏳ Pending Enrollment Requests
          </h2>
          
          {pendingEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-300 text-lg">No pending enrollment requests.</p>
              <p className="text-gray-400 text-sm">New patient requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEnrollments.map((enroll: any, index: number) => (
                <div 
                  key={enroll.id} 
                  className="p-6 rounded-2xl bg-orange-500/20 border border-orange-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-102 hover:bg-orange-500/30 animate-fade-in-up"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🧠</span>
                        <div>
                          <p className="text-white font-semibold text-lg">{enroll.Patient?.name || 'N/A'}</p>
                          <p className="text-gray-300 text-sm">📧 {enroll.Patient?.email || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="text-gray-400 text-sm">
                        📅 Request Date: {new Date(enroll.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveEnrollment(enroll.id)}
                        className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectEnrollment(enroll.id)}
                        className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Patients Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-in-left">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            👥 My Patients
          </h2>
          
          {patients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🩺</div>
              <p className="text-gray-300 text-lg">No enrolled patients yet.</p>
              <p className="text-gray-400 text-sm">Approved enrollments will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {patients.map((enroll: any, index: number) => (
                <div 
                  key={enroll.id} 
                  className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-102 animate-fade-in-up"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-4">🧠</span>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{enroll.Patient?.name || 'N/A'}</h3>
                      <p className="text-emerald-300 text-sm">📧 {enroll.Patient?.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <label className="block text-white font-medium mb-2">💊 Write Prescription:</label>
                    <textarea
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm resize-none"
                      rows={3}
                      placeholder="Enter prescription details, dosage, and instructions..."
                      onChange={(e) => {
                        setNotes(e.target.value)
                        setSelectedEnrollment(enroll.id)
                      }}
                      value={selectedEnrollment === enroll.id ? notes : ''}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ✅ Active Patient
                    </span>
                    <div className="flex space-x-3">
                      <button
                        onClick={handlePrescribe}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center"
                      >
                        <span className="mr-2">💊</span>
                        Issue Prescription
                      </button>
                      <button className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center">
                        <span className="mr-2">💬</span>
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
