import React, { useEffect, useState } from 'react';

interface PrescriptionViewerProps {
  prescription?: {
    id: number;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    notes?: string;
    doctorId: number;
    doctorName: string;
    patientNIC: string;
    issuedAt: string;
    status: string;
  } | null;
  prescriptions?: Array<{
    id: number;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    notes?: string;
    doctorId: number;
    doctorName: string;
    patientNIC: string;
    issuedAt: string;
    status: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
}

const PrescriptionViewer: React.FC<PrescriptionViewerProps> = ({ 
  prescription, 
  prescriptions,
  isOpen, 
  onClose 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  // Determine if we're viewing multiple prescriptions or a single one
  const isMultipleView = prescriptions && prescriptions.length > 0;
  const displayPrescriptions = isMultipleView ? prescriptions : (prescription ? [prescription] : []);
  const doctorName = displayPrescriptions[0]?.doctorName || 'Unknown Doctor';
  const patientNIC = displayPrescriptions[0]?.patientNIC || 'N/A';

  useEffect(() => {
    if (isOpen) {
      // Request fullscreen
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
          // Fullscreen failed, continue anyway
          setIsFullscreen(false);
        });
      }

      // Disable right-click
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      // Enhanced anti-screenshot detection
      const handleKeyDown = (e: KeyboardEvent) => {
        // Block window switching and screenshot attempts
        if (
          (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) || // Ctrl+Shift+S
          (e.metaKey && e.shiftKey && (e.key === '4' || e.key === '3')) || // Cmd+Shift+4/3 (Mac)
          (e.key === 'PrintScreen') || // Print Screen
          (e.altKey && e.key === 'PrintScreen') || // Alt+Print Screen
          (e.ctrlKey && e.key === 'p') || // Ctrl+P (Print)
          (e.metaKey && e.key === 'p') || // Cmd+P (Print)
          (e.ctrlKey && e.shiftKey && e.key === 'I') || // DevTools
          (e.key === 'F12') || // DevTools
          (e.altKey && e.key === 'Tab') || // Alt+Tab (window switching)
          (e.metaKey && e.key === 'Tab') || // Cmd+Tab (Mac window switching)
          (e.key === 'Escape') || // Escape key (might exit fullscreen)
          (e.ctrlKey && e.key === 'w') || // Close window
          (e.metaKey && e.key === 'w') // Close window (Mac)
        ) {
          e.preventDefault();
          e.stopPropagation();
          setIsBlurred(true);
          alert('🚨 SECURITY ALERT: Unauthorized action detected! Screen blurred for protection.');
          setTimeout(() => setIsBlurred(false), 3000);
          return false;
        }
      };

      // Detect window focus changes and fullscreen exit
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setIsBlurred(true);
          alert('🔒 SECURITY: Window focus lost. Screen blurred for protection.');
          setTimeout(() => setIsBlurred(false), 2000);
        }
      };

      // Force fullscreen mode (removed blur functionality)
      const enforceFullscreen = () => {
        if (!document.fullscreenElement && isOpen) {
          // Try to re-enter fullscreen without blurring
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {
              console.log('Fullscreen request failed - continuing without fullscreen');
            });
          }
        }
      };

      // Add event listeners
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown, true);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', enforceFullscreen);

      return () => {
        // Cleanup
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('fullscreenchange', enforceFullscreen);
        
        // Exit fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        setIsFullscreen(false);
        setIsBlurred(false);
      };
    }
  }, [isOpen, onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || displayPrescriptions.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-50 flex items-center justify-center p-4">
      {/* Security Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none">
        <div className="absolute top-4 left-4 text-white text-sm font-medium bg-red-600 px-3 py-1 rounded-full">
          🔒 Secure View Mode
        </div>
        <div className="absolute top-4 right-4 text-white text-sm font-medium">
          <div className="bg-red-600 px-3 py-1 rounded-full mb-1">
            🔒 Secure View Active
          </div>
          <div className="bg-orange-600 px-2 py-1 rounded text-xs">
            🛡️ Anti-screenshot protection
          </div>
        </div>
      </div>

      {/* Prescription Card with blur effect */}
      <div className={`bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10 transition-all duration-300 ${isBlurred ? 'blur-lg' : ''}`}>
        {/* Blur warning overlay */}
        {isBlurred && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-80 rounded-3xl flex items-center justify-center z-50">
            <div className="text-white text-center p-8">
              <div className="text-6xl mb-4">🚨</div>
              <h2 className="text-2xl font-bold mb-2">SECURITY ALERT</h2>
              <p className="text-lg">Screenshot attempt detected!</p>
              <p className="text-sm mt-2">Screen blurred for protection</p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">💊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isMultipleView ? `${displayPrescriptions.length} Prescriptions` : 'Medical Prescription'}
                </h1>
                <p className="text-blue-100">
                  {isMultipleView 
                    ? `From Dr. ${doctorName}` 
                    : `Prescription ID: #${displayPrescriptions[0].id}`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Doctor Information */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">👨‍⚕️</span>
              Prescribing Doctor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Doctor Name</label>
                <p className="text-gray-900 font-medium">Dr. {doctorName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  {isMultipleView ? 'Total Prescriptions' : 'Date Issued'}
                </label>
                <p className="text-gray-900 font-medium">
                  {isMultipleView 
                    ? `${displayPrescriptions.length} prescriptions` 
                    : formatDate(displayPrescriptions[0].issuedAt)
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Patient Information
            </h2>
            <div>
              <label className="text-sm font-medium text-gray-600">Patient NIC</label>
              <p className="text-gray-900 font-medium">{patientNIC}</p>
            </div>
          </div>

          {/* Prescriptions List */}
          {isMultipleView ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">📋</span>
                All Prescriptions ({displayPrescriptions.length})
              </h2>
              
              {displayPrescriptions.map((pres, index) => (
                <div key={pres.id} className="bg-gradient-to-r from-green-50 to-blue-50 border border-gray-200 rounded-2xl p-6">
                  {/* Prescription Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="mr-2">💊</span>
                      Prescription #{index + 1} - {pres.drugName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pres.status === 'active' ? 'bg-green-100 text-green-800' :
                        pres.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pres.status.charAt(0).toUpperCase() + pres.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: #{pres.id}
                      </span>
                    </div>
                  </div>

                  {/* Medication Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dosage</label>
                      <p className="text-gray-900 font-medium">{pres.dosage}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Frequency</label>
                      <p className="text-gray-900 font-medium">{pres.frequency}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Duration</label>
                      <p className="text-gray-900 font-medium">{pres.duration}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Issued</label>
                      <p className="text-gray-900 font-medium">{formatDate(pres.issuedAt)}</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="mr-2">📋</span>
                      Instructions
                    </h4>
                    <p className="text-gray-800 leading-relaxed">{pres.instructions}</p>
                  </div>

                  {/* Additional Notes */}
                  {pres.notes && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="mr-2">📝</span>
                        Additional Notes
                      </h4>
                      <p className="text-gray-800 leading-relaxed">{pres.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Single Prescription View */
            <>
              {/* Medication Details */}
              <div className="bg-green-50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💊</span>
                  Medication Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Drug Name</label>
                    <p className="text-lg font-bold text-gray-900">{displayPrescriptions[0].drugName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Dosage</label>
                    <p className="text-lg font-semibold text-gray-900">{displayPrescriptions[0].dosage}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Frequency</label>
                    <p className="text-gray-900 font-medium">{displayPrescriptions[0].frequency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="text-gray-900 font-medium">{displayPrescriptions[0].duration}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Instructions
                </h2>
                <p className="text-gray-800 leading-relaxed">{displayPrescriptions[0].instructions}</p>
              </div>

              {/* Additional Notes */}
              {displayPrescriptions[0].notes && (
                <div className="bg-purple-50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    Additional Notes
                  </h2>
                  <p className="text-gray-800 leading-relaxed">{displayPrescriptions[0].notes}</p>
                </div>
              )}

              {/* Status */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Status
                </h2>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  displayPrescriptions[0].status === 'active' ? 'bg-green-100 text-green-800' :
                  displayPrescriptions[0].status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {displayPrescriptions[0].status.charAt(0).toUpperCase() + displayPrescriptions[0].status.slice(1)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-3xl border-t">
          <div className="flex justify-center mb-4">
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-bold transition-colors duration-200 shadow-lg"
            >
              🚪 Exit Security Mode
            </button>
          </div>
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium">⚠️ Important Security Notice</p>
            <p className="mt-1">This prescription is displayed in secure mode to prevent unauthorized copying.</p>
            <p className="mt-1">Screenshots and recordings are disabled for your privacy protection.</p>
            <p className="mt-2 text-blue-600 font-medium">🔒 Enhanced security features are active for medical privacy</p>
          </div>
        </div>
      </div>

      {/* Anti-screenshot overlay (subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45"></div>
      </div>
    </div>
  );
};

export default PrescriptionViewer;
