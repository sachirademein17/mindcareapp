import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([])
  const [allEnrollments, setAllEnrollments] = useState([])

  useEffect(() => {
    fetchApprovedEnrollments()
    fetchAllEnrollments()
  }, [])

  const fetchApprovedEnrollments = () => {
    axios.get('http://localhost:5000/patient/enrollments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setDoctors(res.data))
      .catch(err => console.error('Error fetching doctors:', err))
  }

  const fetchAllEnrollments = () => {
    axios.get('http://localhost:5000/patient/all-enrollments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setAllEnrollments(res.data))
      .catch(err => console.error('Error fetching all enrollments:', err))
  }

  const handleCancelEnrollment = async (doctorId: number) => {
    try {
      await axios.delete(`http://localhost:5000/patient/cancel-enrollment/${doctorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('Enrollment request cancelled!')
      fetchAllEnrollments()
      fetchApprovedEnrollments()
    } catch (err) {
      console.error('Error cancelling enrollment:', err)
      alert('Failed to cancel enrollment')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>
      
      <div className="mb-6 flex gap-4">
        <Link 
          to="/patient/find-doctors" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg inline-block"
        >
          Find New Doctors
        </Link>
        <Link 
          to="/patient/prescriptions" 
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg inline-block"
        >
          View Prescriptions
        </Link>
        <Link 
          to="/patient/chat" 
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg inline-block"
        >
          💬 Chat with Doctors
        </Link>
      </div>

      <h2 className="text-2xl font-semibold mb-4">All Enrollment Requests</h2>
      {allEnrollments.length === 0 ? (
        <p className="text-gray-500">No enrollment requests yet.</p>
      ) : (
        allEnrollments.map((enroll: any) => (
          <div key={enroll.id} className={`border shadow p-4 mb-4 rounded ${
            enroll.status === 'approved' ? 'bg-green-50 border-green-200' :
            enroll.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <p><strong>Doctor:</strong> {enroll.Doctor?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {enroll.Doctor?.email || 'N/A'}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    enroll.status === 'approved' ? 'bg-green-200 text-green-800' :
                    enroll.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {enroll.status.charAt(0).toUpperCase() + enroll.status.slice(1)}
                  </span>
                </p>
                <p><strong>Request Date:</strong> {new Date(enroll.createdAt).toLocaleDateString()}</p>
              </div>
              {enroll.status === 'pending' && (
                <button
                  onClick={() => handleCancelEnrollment(enroll.doctorId)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        ))
      )}

      <h2 className="text-2xl font-semibold mb-4 mt-8 text-green-600">My Current Doctors</h2>
      {doctors.length === 0 && <p>No enrolled doctors yet.</p>}
      {doctors.map((enroll: any) => (
        <div key={enroll.id} className="bg-white shadow p-4 mb-4 rounded">
          <p><strong>Name:</strong> {enroll.Doctor?.name || 'N/A'}</p>
          <p><strong>Email:</strong> {enroll.Doctor?.email || 'N/A'}</p>
          <p><strong>Status:</strong> <span className="text-green-600">{enroll.status}</span></p>
          {/* Add buttons for chat, meeting, prescriptions etc. */}
        </div>
      ))}
    </div>
  )
}

export default PatientDashboard
