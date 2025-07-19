import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([])
  const [pendingEnrollments, setPendingEnrollments] = useState([])
  const [notes, setNotes] = useState('')
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)

  useEffect(() => {
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
      alert('Enrollment approved!')
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
      alert('Enrollment rejected!')
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
      alert('Prescription Issued!')
      setNotes('')
    } catch (err) {
      console.error('Error issuing prescription:', err)
      alert('Failed to issue prescription')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>
      
      {/* Navigation Links */}
      <div className="mb-6 flex gap-4">
        <Link 
          to="/doctor/chat" 
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg inline-block"
        >
          💬 Chat with Patients
        </Link>
      </div>
      
      {/* Pending Enrollment Requests */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-orange-600">Pending Enrollment Requests</h2>
        {pendingEnrollments.length === 0 ? (
          <p className="text-gray-500">No pending enrollment requests.</p>
        ) : (
          pendingEnrollments.map((enroll: any) => (
            <div key={enroll.id} className="bg-orange-50 border border-orange-200 shadow p-4 mb-4 rounded">
              <p><strong>Patient Name:</strong> {enroll.Patient?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {enroll.Patient?.email || 'N/A'}</p>
              <p><strong>Request Date:</strong> {new Date(enroll.createdAt).toLocaleDateString()}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleApproveEnrollment(enroll.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleRejectEnrollment(enroll.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approved Patients */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-green-600">My Patients</h2>
        {patients.length === 0 ? (
          <p className="text-gray-500">No enrolled patients yet.</p>
        ) : (
          patients.map((enroll: any) => (
            <div key={enroll.id} className="bg-white shadow p-4 mb-4 rounded">
              <p><strong>Name:</strong> {enroll.Patient?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {enroll.Patient?.email || 'N/A'}</p>
              <textarea
                className="mt-2 p-2 border w-full"
                placeholder="Write prescription..."
                onChange={(e) => {
                  setNotes(e.target.value)
                  setSelectedEnrollment(enroll.id)
                }}
              />
              <button
                onClick={handlePrescribe}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Issue Prescription
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DoctorDashboard
