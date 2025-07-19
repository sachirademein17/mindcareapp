import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Chat from '../common/Chat'

const DoctorChat = () => {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

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
    })
      .catch(err => console.error('Error fetching patients:', err))
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chat with Patients</h1>
        <Link 
          to="/doctor/dashboard" 
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Your Patients</h2>
          {patients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No enrolled patients yet.</p>
              <p className="text-sm text-gray-400">
                Patients will appear here after they enroll and you approve them.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((patient: any) => (
                <div 
                  key={patient.Patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPatient?.Patient.id === patient.Patient.id 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className="font-semibold">{patient.Patient.name}</h3>
                  <p className="text-sm text-gray-600">{patient.Patient.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Enrolled: {new Date(patient.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-xs text-blue-600">Active Patient</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div>
              <div className="bg-white border rounded-lg p-4 mb-4">
                <h2 className="text-xl font-semibold">
                  Chatting with {selectedPatient.Patient.name}
                </h2>
                <p className="text-gray-600">{selectedPatient.Patient.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Patient since: {new Date(selectedPatient.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Chat receiverId={selectedPatient.Patient.id.toString()} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">🩺</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a patient to start chatting
                </h3>
                <p className="text-gray-500">
                  Choose a patient from the list to begin your conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorChat
