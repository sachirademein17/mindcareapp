import React from 'react'
import { AlertTriangle, X, Calendar, FileText, LogOut } from 'lucide-react'

interface SuspensionAlertProps {
  isOpen: boolean
  onClose: () => void
  suspensionReason: string
  suspensionDate: string
  onLogout: () => void
}

const SuspensionAlert: React.FC<SuspensionAlertProps> = ({
  isOpen,
  onClose,
  suspensionReason,
  suspensionDate,
  onLogout
}) => {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <AlertTriangle size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Account Suspended</h2>
              <p className="text-red-100 text-sm">Access Restricted</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Suspension Message */}
          <div className="bg-white/60 rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center">
              <FileText size={18} className="mr-2" />
              Suspension Notice
            </h3>
            <p className="text-red-700 text-sm leading-relaxed">
              Your account has been temporarily suspended due to a violation of our terms of service.
            </p>
          </div>

          {/* Suspension Details */}
          <div className="space-y-4">
            <div className="bg-white/60 rounded-lg p-4 border border-red-200">
              <h4 className="font-medium text-red-800 mb-2">Reason for Suspension:</h4>
              <p className="text-red-700 text-sm bg-white/50 p-3 rounded border">
                {suspensionReason}
              </p>
            </div>

            <div className="bg-white/60 rounded-lg p-4 border border-red-200">
              <h4 className="font-medium text-red-800 mb-2 flex items-center">
                <Calendar size={16} className="mr-2" />
                Suspended On:
              </h4>
              <p className="text-red-700 text-sm font-mono bg-white/50 p-2 rounded border">
                {formatDate(suspensionDate)}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
            <p className="text-blue-700 text-sm mb-3">
              If you believe this suspension was made in error or would like to appeal, please contact our support team.
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>📧 Email: support@mindcare.com</p>
              <p>📞 Phone: +94 11 234 5678</p>
              <p>🕒 Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onLogout}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-300"
            >
              Close
            </button>
          </div>

          {/* Footer Warning */}
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
            <p className="text-red-700 text-xs">
              ⚠️ Attempting to circumvent this suspension may result in permanent account termination.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuspensionAlert
