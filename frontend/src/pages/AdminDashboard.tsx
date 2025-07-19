
import { useEffect, useState } from 'react'
import axios from 'axios'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])

  const token = localStorage.getItem('token')

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    setUsers(res.data)
  }

  const approveDoctor = async (id: string) => {
    await axios.put(`http://localhost:5000/admin/approve-doctor/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchUsers()
  }

  const deleteUser = async (id: string) => {
    await axios.delete(`http://localhost:5000/admin/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user: any) => (
          <div key={user.id} className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm">Role: {user.role}</p>

            {user.role === 'doctor' && user.DoctorDetail && (
              <div className="mt-2">
                <p className="text-sm">Specialization: {user.DoctorDetail.specialization}</p>
                <p className="text-sm">Gender: {user.DoctorDetail.gender}</p>
                <p className="text-sm">
                  Languages: {
                    (() => {
                      try {
                        const languages = JSON.parse(user.DoctorDetail.languages)
                        return Array.isArray(languages) ? languages.join(', ') : user.DoctorDetail.languages
                      } catch {
                        return user.DoctorDetail.languages
                      }
                    })()
                  }
                </p>
                <p className="text-sm">
                  Status: <span className={user.DoctorDetail?.approved ? 'text-green-600' : 'text-red-600'}>
                    {user.DoctorDetail?.approved ? 'Approved' : 'Pending'}
                  </span>
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              {user.role === 'doctor' && !user.DoctorDetail?.approved && (
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => approveDoctor(user.id)}
                >
                  Approve
                </button>
              )}
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => deleteUser(user.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
