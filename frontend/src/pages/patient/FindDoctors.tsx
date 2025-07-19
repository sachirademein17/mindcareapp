import { useState } from 'react'
import axios from 'axios'

const FindDoctors = () => {
  const [location, setLocation] = useState('')
  const [language, setLanguage] = useState('')
  const [doctors, setDoctors] = useState([])
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<{[key: string]: string}>({})

  const handleSearch = async () => {
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
      alert('Failed to search doctors')
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
      alert('Enrollment request sent successfully!')
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
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Find Doctors</h2>
      <div className="flex gap-4 mb-4">
        <select 
          value={location} 
          onChange={e => setLocation(e.target.value)} 
          className="p-2 border rounded"
        >
          <option value="">All Locations</option>
          <option value="Colombo">Colombo</option>
          <option value="Kandy">Kandy</option>
          <option value="Galle">Galle</option>
          <option value="Jaffna">Jaffna</option>
          <option value="Negombo">Negombo</option>
          <option value="Matara">Matara</option>
          <option value="Kurunegala">Kurunegala</option>
          <option value="Anuradhapura">Anuradhapura</option>
        </select>
        
        <select 
          value={language} 
          onChange={e => setLanguage(e.target.value)} 
          className="p-2 border rounded"
        >
          <option value="">All Languages</option>
          <option value="English">English</option>
          <option value="Sinhala">Sinhala</option>
          <option value="Tamil">Tamil</option>
        </select>
        
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
      </div>

      {doctors.map((doc: any) => (
        <div key={doc.id} className="bg-white shadow p-4 mb-4 rounded">
          <h3 className="text-lg font-semibold">{doc.name}</h3>
          <p>Email: {doc.email}</p>
          {doc.DoctorDetail && (
            <>
              <p>Specialization: {doc.DoctorDetail.specialization}</p>
              <p>Gender: {doc.DoctorDetail.gender}</p>
              <p>Location: {doc.DoctorDetail.location}</p>
              <p>Languages: {
                (() => {
                  try {
                    const languages = JSON.parse(doc.DoctorDetail.languages)
                    return Array.isArray(languages) ? languages.join(', ') : doc.DoctorDetail.languages
                  } catch {
                    return doc.DoctorDetail.languages
                  }
                })()
              }</p>
            </>
          )}
          {(() => {
            const status = enrollmentStatuses[doc.id]
            if (status === 'approved') {
              return (
                <span className="mt-2 bg-green-100 text-green-800 px-4 py-1 rounded inline-block">
                  ✓ Enrolled
                </span>
              )
            } else if (status === 'pending') {
              return (
                <div className="mt-2 flex gap-2">
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded inline-block">
                    ⏳ Pending Approval
                  </span>
                  <button 
                    onClick={() => handleCancelEnrollment(doc.id)} 
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Cancel Request
                  </button>
                </div>
              )
            } else {
              return (
                <button 
                  onClick={() => handleEnroll(doc.id)} 
                  className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Enroll
                </button>
              )
            }
          })()}
        </div>
      ))}
    </div>
  )
}

export default FindDoctors
