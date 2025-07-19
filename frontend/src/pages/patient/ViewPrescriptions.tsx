import { useEffect, useState } from 'react'
import axios from 'axios'

const ViewPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/patient/prescriptions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setPrescriptions(res.data)
      } catch (error) {
        console.error('Error fetching prescriptions:', error)
        alert('Failed to fetch prescriptions')
      }
    }

    
    fetchPrescriptions()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Prescriptions</h2>
      {prescriptions.length === 0 ? (
        <p>No prescriptions yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {prescriptions.map((pres: any) => (
            <div key={pres.id} className="bg-white shadow rounded p-4 border">
              <h3 className="text-lg font-semibold mb-2">Prescription from Dr. {pres.Enrollment?.Doctor?.name}</h3>
              <div className="bg-gray-50 p-3 rounded mb-2">
                <p className="text-gray-700 whitespace-pre-wrap">{pres.notes}</p>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Doctor Email: <strong>{pres.Enrollment?.Doctor?.email}</strong>
              </p>
              <p className="text-xs text-gray-500">Issued: {new Date(pres.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ViewPrescriptions
