import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../../styles/security.css'

const ViewPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(0)

  useEffect(() => {
    // 🔒 Enhanced Security System
    const initSecurity = () => {
      // Disable context menu
      const handleContextMenu = (e: Event) => {
        e.preventDefault()
        setSecurityAlerts(prev => prev + 1)
        alert('🔒 Right-click disabled for medical privacy')
      }

      // Disable keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === 'PrintScreen' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U') ||
          (e.metaKey && e.shiftKey && (e.key === 'S' || e.key === '3' || e.key === '4')) ||
          e.key === 'F12' ||
          (e.ctrlKey && e.key === 's')
        ) {
          e.preventDefault()
          e.stopPropagation()
          setSecurityAlerts(prev => prev + 1)
          alert('🚨 Screenshot/DevTools blocked for medical privacy!')
          return false
        }
      }

      // Monitor page visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setSecurityAlerts(prev => prev + 1)
        }
      }

      // Block text selection and dragging
      const blockSelection = (e: Event) => {
        e.preventDefault()
        setSecurityAlerts(prev => prev + 1)
      }

      // Apply all event listeners
      document.addEventListener('contextmenu', handleContextMenu)
      document.addEventListener('keydown', handleKeyDown, true)
      document.addEventListener('keyup', handleKeyDown, true)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      document.addEventListener('selectstart', blockSelection)
      document.addEventListener('dragstart', blockSelection)

      // Add copy prevention
      const handleCopy = (e: Event) => {
        e.preventDefault()
        setSecurityAlerts(prev => prev + 1)
        alert('🔒 Copying disabled for medical privacy')
      }

      document.addEventListener('copy', handleCopy)

      // Cleanup function
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu)
        document.removeEventListener('keydown', handleKeyDown, true)
        document.removeEventListener('keyup', handleKeyDown, true)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        document.removeEventListener('selectstart', blockSelection)
        document.removeEventListener('dragstart', blockSelection)
        document.removeEventListener('copy', handleCopy)
      }
    }

    // Initialize security and fetch data
    const cleanup = initSecurity()

    const fetchPrescriptions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/patient/prescriptions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setPrescriptions(res.data)
      } catch (error) {
        console.error('Error fetching prescriptions:', error)
        alert('❌ Failed to fetch prescriptions')
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
    return cleanup
  }, [])

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 relative overflow-hidden medical-secure"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 🔒 Print Warning */}
      <div className="print-warning">
        🔒 CONFIDENTIAL MEDICAL RECORD - PRINTING/SCREENSHOT PROHIBITED
      </div>

      {/* 🔒 Security Watermark */}
      <div className="security-watermark"></div>
      
      {/* 🔒 Security Indicator */}
      <div className="security-indicator">🔒 SECURE</div>
      
      {/* Security Alerts */}
      {securityAlerts > 0 && (
        <div className="fixed top-4 left-4 bg-red-600/90 text-white px-3 py-2 rounded-full text-sm font-bold animate-pulse z-50">
          ⚠️ Violations: {securityAlerts}
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/10 text-4xl animate-float animation-delay-1000">📋</div>
        <div className="absolute top-32 right-1/3 text-white/10 text-3xl animate-float animation-delay-3000">💊</div>
        <div className="absolute bottom-24 left-1/3 text-white/10 text-3xl animate-float animation-delay-5000">🩺</div>
        <div className="absolute bottom-40 right-1/4 text-white/10 text-4xl animate-float animation-delay-7000">✨</div>
      </div>

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          {/* 🔒 Security Notice */}
          <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">🔒</span>
              <h3 className="text-red-300 font-bold text-lg">CONFIDENTIAL MEDICAL INFORMATION</h3>
            </div>
            <p className="text-red-200 text-sm">
              🛡️ Advanced screenshot protection is active for your privacy and security.
              <br />
              🚫 Unauthorized sharing or copying of this information is strictly prohibited.
            </p>
          </div>
          
          <Link 
            to="/patient/dashboard" 
            className="inline-flex items-center text-green-300 hover:text-green-200 transition-colors duration-300 mb-4 group"
          >
            <span className="mr-2 group-hover:translate-x-[-4px] transition-transform duration-300">←</span>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Your Prescriptions
          </h1>
          <p className="text-gray-300 text-lg animate-fade-in animation-delay-1000">
            📋 Review your medical prescriptions and treatment plans
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-in-up">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-gray-300 text-lg">Loading prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">📋</div>
              <p className="text-gray-300 text-lg">No prescriptions yet.</p>
              <p className="text-gray-400 text-sm mt-2">Your medical prescriptions will appear here once doctors prescribe medications.</p>
              <Link 
                to="/patient/find-doctors" 
                className="mt-6 inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="mr-2">🔍</span>
                Find Doctors
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                💊 Medical Prescriptions ({prescriptions.length})
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                {prescriptions.map((pres: any, index: number) => (
                  <div 
                    key={pres.id} 
                    className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up content-protection"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none'
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">👨‍⚕️</span>
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            Dr. {pres.Enrollment?.Doctor?.name || 'Unknown Doctor'}
                          </h3>
                          <p className="text-green-300 text-sm">
                            📧 {pres.Enrollment?.Doctor?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium mb-1">
                          ✅ Active
                        </div>
                        <p className="text-xs text-gray-400">
                          📅 {new Date(pres.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Prescription Content - Secured */}
                    <div 
                      className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-4 mb-4 relative"
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none'
                      }}
                    >
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">📝</span>
                        <h4 className="text-green-300 font-semibold">Prescription Details</h4>
                        <div className="ml-auto text-red-400 text-xs opacity-50">🔒 PROTECTED</div>
                      </div>
                      <div 
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 relative"
                        style={{
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none'
                        }}
                      >
                        <p 
                          className="text-gray-200 whitespace-pre-wrap leading-relaxed"
                          style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none'
                          }}
                        >
                          {pres.notes}
                        </p>
                        <div className="absolute top-1 right-1 text-red-500 text-xs opacity-30">🛡️</div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-300 text-sm">
                        <span className="mr-2">🕐</span>
                        <span>Issued: {new Date(pres.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to="/patient/chat"
                          className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center"
                        >
                          <span className="mr-2">💬</span>
                          Ask Questions
                        </Link>
                        <button 
                          className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center"
                          onClick={() => {
                            const confirmed = confirm('⚠️ SECURITY NOTICE: Downloaded prescriptions contain sensitive medical information. Ensure secure storage and do not share unauthorized copies. Continue?')
                            if (confirmed) {
                              alert('🔒 Secure download initiated. Please handle with care.')
                            }
                          }}
                        >
                          <span className="mr-2">📄</span>
                          Secure Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewPrescriptions
