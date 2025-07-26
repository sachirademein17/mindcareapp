import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { createApiUrl } from '../../utils/api'

const ViewPrescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(0)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleViewDetails = (prescription: any) => {
    setSelectedPrescription(prescription)
    setShowDetails(true)
  }

  const closeDetails = () => {
    setSelectedPrescription(null)
    setShowDetails(false)
  }

  useEffect(() => {
    console.log('🔍 ViewPrescriptions component mounted')

    const initSecurity = () => {
      console.log('🔒 Initializing security measures')
      
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        setSecurityAlerts(prev => prev + 1)
        console.log('🚫 Context menu blocked')
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        // Block common screenshot/copy keys
        if (
          (e.ctrlKey && (e.key === 's' || e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'p')) ||
          e.key === 'F12' ||
          e.key === 'PrintScreen' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault()
          setSecurityAlerts(prev => prev + 1)
          console.log('🚫 Security key blocked:', e.key)
        }
      }

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          console.log('🔒 Page hidden - potential screenshot attempt')
          setSecurityAlerts(prev => prev + 1)
        }
      }

      const blockSelection = (e: Event) => {
        e.preventDefault()
        return false
      }

      const handleCopy = (e: ClipboardEvent) => {
        e.preventDefault()
        setSecurityAlerts(prev => prev + 1)
        console.log('🚫 Copy blocked')
      }

      document.addEventListener('contextmenu', handleContextMenu)
      document.addEventListener('keydown', handleKeyDown, true)
      document.addEventListener('keyup', handleKeyDown, true)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      document.addEventListener('selectstart', blockSelection)
      document.addEventListener('dragstart', blockSelection)
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
        const res = await axios.get(createApiUrl('patient/prescriptions'), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        console.log('🔍 Fetched prescription data:', res.data) // Debug log
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  💊 Medical Prescriptions ({prescriptions.length})
                </h2>
                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-4 py-2">
                  <p className="text-emerald-300 text-sm font-medium">
                    📊 Total Active: {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Safety Information */}
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-4 mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">⚠️</span>
                  <h3 className="text-yellow-300 font-bold">Important Safety Information</h3>
                </div>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>• Take medications exactly as prescribed by your doctor</li>
                  <li>• Do not share medications with others</li>
                  <li>• Contact your doctor if you experience any side effects</li>
                  <li>• Store medications in a cool, dry place away from children</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {/* Condensed Header */}
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">💊</div>
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {pres.drugName || 'Prescription'}
                      </h3>
                      <p className="text-green-300 text-sm">
                        Dr. {pres.Enrollment?.Doctor?.name || 'Unknown Doctor'}
                      </p>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">📅 Date:</span>
                        <span className="text-white">{new Date(pres.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">🕐 Time:</span>
                        <span className="text-white">{new Date(pres.createdAt).toLocaleTimeString()}</span>
                      </div>
                      {pres.dosage && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">⚖️ Dosage:</span>
                          <span className="text-white">{pres.dosage}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="text-center mb-4">
                      <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium inline-block">
                        ✅ Active
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleViewDetails(pres)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                      >
                        <span className="mr-2">👁️</span>
                        View Full Details
                      </button>
                      <div className="flex space-x-2">
                        <Link
                          to="/patient/chat"
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        >
                          <span className="mr-1">💬</span>
                          Chat
                        </Link>
                        <button 
                          className="flex-1 bg-teal-500 hover:bg-teal-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                          onClick={() => {
                            const confirmed = confirm('⚠️ SECURITY NOTICE: Downloaded prescriptions contain sensitive medical information. Continue?')
                            if (confirmed) {
                              alert('🔒 Secure download initiated.')
                            }
                          }}
                        >
                          <span className="mr-1">📄</span>
                          Download
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

      {/* Prescription Details Modal */}
      {showDetails && selectedPrescription && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-3">💊</span>
                Prescription Details
              </h2>
              <button
                onClick={closeDetails}
                className="text-white hover:text-red-300 transition-colors duration-300 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Doctor Information */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <span className="mr-2">👨‍⚕️</span>
                  Doctor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Doctor Name:</p>
                    <p className="text-white font-medium">Dr. {selectedPrescription.Enrollment?.Doctor?.name || 'Unknown Doctor'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email:</p>
                    <p className="text-white font-medium">{selectedPrescription.Enrollment?.Doctor?.email || 'No email available'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Issue Date:</p>
                    <p className="text-white font-medium">{new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Issue Time:</p>
                    <p className="text-white font-medium">{new Date(selectedPrescription.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {/* Prescription Details */}
              {selectedPrescription.drugName ? (
                /* Detailed prescription format */
                <div className="space-y-4">
                  {/* Drug Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-400/20">
                      <p className="text-blue-300 text-sm font-medium mb-2">💊 Medication</p>
                      <p className="text-white font-semibold text-lg">{selectedPrescription.drugName}</p>
                    </div>
                    <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-400/20">
                      <p className="text-purple-300 text-sm font-medium mb-2">⚖️ Dosage</p>
                      <p className="text-white font-semibold text-lg">{selectedPrescription.dosage}</p>
                    </div>
                  </div>

                  {/* Timing Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-400/20">
                      <p className="text-orange-300 text-sm font-medium mb-2">⏰ Frequency</p>
                      <p className="text-white font-semibold text-lg">{selectedPrescription.frequency}</p>
                    </div>
                    <div className="bg-teal-500/10 p-4 rounded-xl border border-teal-400/20">
                      <p className="text-teal-300 text-sm font-medium mb-2">📅 Duration</p>
                      <p className="text-white font-semibold text-lg">{selectedPrescription.duration}</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-green-500/10 p-4 rounded-xl border border-green-400/20">
                    <p className="text-green-300 text-sm font-medium mb-3">📋 Instructions for Use</p>
                    <p className="text-gray-200 leading-relaxed">{selectedPrescription.instructions}</p>
                  </div>

                  {/* Additional Notes */}
                  {selectedPrescription.notes && (
                    <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-400/20">
                      <p className="text-yellow-300 text-sm font-medium mb-3">📝 Additional Notes</p>
                      <p className="text-gray-200 leading-relaxed">{selectedPrescription.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Legacy format */
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-gray-200 leading-relaxed">
                    {selectedPrescription.notes || 'No prescription details available'}
                  </p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-white/20">
                <button
                  onClick={closeDetails}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-300"
                >
                  Close
                </button>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    const confirmed = confirm('⚠️ SECURITY NOTICE: Downloaded prescriptions contain sensitive medical information. Continue?')
                    if (confirmed) {
                      alert('🔒 Secure download initiated.')
                    }
                  }}
                >
                  <span className="mr-2">📄</span>
                  Download Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewPrescriptions
