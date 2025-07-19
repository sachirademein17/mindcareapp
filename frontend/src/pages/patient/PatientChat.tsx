import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Chat from '../common/Chat'

const PatientChat = () => {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)

  useEffect(() => {
    fetchApprovedDoctors()
  }, [])

  const fetchApprovedDoctors = () => {
    axios.get('http://localhost:5000/patient/enrollments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      setDoctors(res.data)
      // Auto-select first doctor if available
      if (res.data.length > 0) {
        setSelectedDoctor(res.data[0])
      }
    })
      .catch(err => console.error('Error fetching doctors:', err))
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chat with Doctors</h1>
        <Link 
          to="/patient/dashboard" 
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Your Doctors</h2>
          {doctors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No enrolled doctors yet.</p>
              <Link 
                to="/patient/find-doctors"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-block"
              >
                Find Doctors
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doctor: any) => (
                <div 
                  key={doctor.Doctor.id}
                  onClick={() => setSelectedDoctor(doctor)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDoctor?.Doctor.id === doctor.Doctor.id 
                      ? 'bg-blue-100 border-blue-500' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className="font-semibold">{doctor.Doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.Doctor.email}</p>
                  <div className="flex items-center mt-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-xs text-green-600">Available</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedDoctor ? (
            <div>
              <div className="bg-white border rounded-lg p-4 mb-4">
                <h2 className="text-xl font-semibold">
                  Chatting with Dr. {selectedDoctor.Doctor.name}
                </h2>
                <p className="text-gray-600">{selectedDoctor.Doctor.email}</p>
              </div>
              <Chat receiverId={selectedDoctor.Doctor.id.toString()} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a doctor to start chatting
                </h3>
                <p className="text-gray-500">
                  Choose a doctor from the list to begin your conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientChat
