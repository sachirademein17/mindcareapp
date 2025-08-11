import { useEffect } from 'react'

const DoctorDashboardTest = () => {
  useEffect(() => {
    console.log('🟢 DoctorDashboardTest component mounted successfully!')
    console.log('🔍 Checking localStorage:')
    console.log('   Token:', localStorage.getItem('token')?.substring(0, 20) + '...')
    console.log('   User ID:', localStorage.getItem('userId'))
    console.log('   Role:', localStorage.getItem('role'))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🩺 Doctor Dashboard Test
        </h1>
        
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">✅ Dashboard Loading Test</h2>
          <p className="text-lg">
            If you can see this message, the doctor dashboard component is loading correctly!
          </p>
          <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-400/30">
            <p className="text-green-300">
              🎉 Success! The routing and component rendering is working.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🔍 Authentication Check</h2>
          <div className="space-y-2">
            <p>Token: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</p>
            <p>User ID: {localStorage.getItem('userId') || '❌ Missing'}</p>
            <p>Role: {localStorage.getItem('role') || '❌ Missing'}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8">
          <h2 className="text-2xl font-semibold mb-4">📋 Next Steps</h2>
          <div className="space-y-2">
            <p>1. ✅ Component rendering works</p>
            <p>2. ⏳ Check authentication status above</p>
            <p>3. ⏳ Test API connections</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboardTest
