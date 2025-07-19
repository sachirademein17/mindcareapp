import { useNavigate } from 'react-router-dom'

export default function SelectRole() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <h1 className="text-3xl font-bold mb-8">Choose Your Role</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div
          onClick={() => navigate('/login/doctor')}
          className="cursor-pointer bg-white rounded-2xl shadow-xl p-10 text-center hover:bg-indigo-100 transition"
        >
          <h2 className="text-xl font-semibold">Doctor</h2>
          <p>Login or sign up as a doctor</p>
        </div>
        <div
          onClick={() => navigate('/login/patient')}
          className="cursor-pointer bg-white rounded-2xl shadow-xl p-10 text-center hover:bg-indigo-100 transition"
        >
          <h2 className="text-xl font-semibold">Patient</h2>
          <p>Login or sign up as a patient</p>
        </div>
      </div>
    </div>
  )
}
