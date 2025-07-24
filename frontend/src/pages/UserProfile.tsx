import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { createApiUrl } from '../config/api'

interface User {
  id: number
  name: string
  email: string
  nic: string
  role: string
  gender?: string
  dob?: string
  phone?: string
  isApproved: boolean
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nic: '',
    gender: '',
    dob: '',
    phone: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [deletePassword, setDeletePassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(createApiUrl('user/profile'), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setUser(response.data)
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        nic: response.data.nic || '',
        gender: response.data.gender || '',
        dob: response.data.dob ? response.data.dob.split('T')[0] : '',
        phone: response.data.phone || ''
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setMessage('')

    try {
      const response = await axios.put(createApiUrl('user/profile'), formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      setUser(response.data.user)
      setEditing(false)
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error })
      }
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setMessage('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters long' })
      return
    }

    try {
      await axios.put(createApiUrl('user/change-password'), {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      setMessage('Password changed successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Error changing password:', error)
      if (error.response?.data?.error) {
        setErrors({ password: error.response.data.error })
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setErrors({ deletePassword: 'Password is required' })
      return
    }

    try {
      await axios.delete(createApiUrl('user/account'), {
        data: { password: deletePassword },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      navigate('/auth/login')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      if (error.response?.data?.error) {
        setErrors({ deletePassword: error.response.data.error })
      }
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500'
      case 'doctor': return 'bg-blue-500'
      case 'patient': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard'
    if (user?.role === 'doctor') return '/doctor/dashboard'
    if (user?.role === 'patient') return '/patient/dashboard'
    return '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden font-inter">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-8"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <button 
            onClick={() => navigate(getDashboardPath())}
            className="group inline-flex items-center text-purple-300 hover:text-pink-300 transition-all duration-500 mb-4 hover:scale-105 transform"
          >
            <span className="mr-2 group-hover:translate-x-[-6px] group-hover:scale-110 transition-all duration-300 text-xl">←</span>
            <span className="font-medium tracking-wide">Back to Dashboard</span>
          </button>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-4 animate-pulse hover:scale-105 transition-transform duration-500 font-poppins">
            My Account
          </h1>
          <p className="text-gray-300 text-xl font-light tracking-wide opacity-90">
            Manage your profile and account settings
          </p>
        </div>

        {message && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-green-300 text-center">
            {message}
          </div>
        )}

        {errors.general && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-center">
            {errors.general}
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Information */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center group">
                <span className="mr-3 text-purple-400 group-hover:rotate-12 transition-transform duration-300">👤</span>
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Profile Information</span>
              </h2>
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg transform hover:scale-110 transition-all duration-300 ${getRoleBadgeColor(user?.role || '')} hover:shadow-lg`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-500 transform hover:scale-105 hover:shadow-lg font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-purple-200 mb-3 tracking-wide">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 group-hover:border-purple-400/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-purple-200 mb-3 tracking-wide">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 group-hover:border-purple-400/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-purple-200 mb-3 tracking-wide">NIC</label>
                    <input
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 group-hover:border-purple-400/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-purple-200 mb-3 tracking-wide">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 group-hover:border-purple-400/50 backdrop-blur-sm"
                    >
                      <option value="" className="bg-slate-800">Select Gender</option>
                      <option value="Male" className="bg-slate-800">Male</option>
                      <option value="Female" className="bg-slate-800">Female</option>
                      <option value="Other" className="bg-slate-800">Other</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-purple-200 mb-3 tracking-wide">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 group-hover:border-purple-400/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-purple-200 mb-3 tracking-wide">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 group-hover:border-purple-400/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-8 py-4 border border-gray-300/50 rounded-2xl text-gray-300 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:border-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-400 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                    <p className="text-white text-lg">{user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <p className="text-white text-lg">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">NIC</label>
                    <p className="text-white text-lg">{user?.nic}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
                    <p className="text-white text-lg">{user?.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                    <p className="text-white text-lg">
                      {user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <p className="text-white text-lg">{user?.phone || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-[1.02]">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center group">
              <span className="mr-3 text-purple-400 group-hover:rotate-12 transition-transform duration-300">⚙️</span>
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Account Actions</span>
            </h2>
            
            <div className="space-y-4">
              {/* Change Password */}
              <div className="border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Change Password</h3>
                    <p className="text-gray-400 text-sm">Update your account password</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                  >
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
                
                {showPasswordForm && (
                  <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                      required
                    />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                      required
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                      required
                    />
                    {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                    {errors.newPassword && <p className="text-red-400 text-sm">{errors.newPassword}</p>}
                    {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
                    <button
                      type="submit"
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-400 hover:to-blue-500 transition-all duration-300"
                    >
                      Update Password
                    </button>
                  </form>
                )}
              </div>

              {/* Delete Account */}
              <div className="border border-red-400/30 rounded-xl p-4 bg-red-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-red-300 font-semibold">Delete Account</h3>
                    <p className="text-red-400 text-sm">Permanently delete your account and all data</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    className="px-4 py-2 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                  >
                    {showDeleteConfirm ? 'Cancel' : 'Delete Account'}
                  </button>
                </div>
                
                {showDeleteConfirm && (
                  <div className="mt-4 space-y-3">
                    <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
                      <p className="text-red-300 text-sm font-medium">Warning</p>
                      <p className="text-red-400 text-sm">This action cannot be undone. All your data will be permanently deleted.</p>
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your password to confirm"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/20 border border-red-400/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      required
                    />
                    {errors.deletePassword && <p className="text-red-400 text-sm">{errors.deletePassword}</p>}
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-400 hover:to-red-500 transition-all duration-300"
                    >
                      I understand, delete my account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
