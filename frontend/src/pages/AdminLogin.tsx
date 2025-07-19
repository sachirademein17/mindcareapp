import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: any) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:5000/auth/admin/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userId', res.data.user.id.toString())
      localStorage.setItem('role', 'admin')
      navigate('/admin/dashboard')
    } catch (err) {
      alert('Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-6">Admin Login</h2>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 mb-4 border rounded" placeholder="Email" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 mb-4 border rounded" placeholder="Password" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  )
}

export default AdminLogin
