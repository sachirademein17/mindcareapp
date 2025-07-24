// Enhanced Confirmation Dialog Component for Critical Actions

import { useState } from 'react'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  warningItems: string[]
  confirmText?: string
  requireTyping?: boolean
  type?: 'danger' | 'warning' | 'info'
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warningItems,
  confirmText = "CONFIRM",
  requireTyping = false,
  type = 'danger'
}: ConfirmationDialogProps) => {
  const [userInput, setUserInput] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (requireTyping && userInput !== confirmText) {
      alert(`❌ Please type "${confirmText}" exactly to confirm`)
      return
    }
    
    setIsConfirming(true)
    try {
      await onConfirm()
      onClose()
      setUserInput('')
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }

  const handleClose = () => {
    setUserInput('')
    onClose()
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          headerBg: 'bg-gradient-to-r from-red-600 to-red-700',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          icon: '🚨'
        }
      case 'warning':
        return {
          headerBg: 'bg-gradient-to-r from-orange-600 to-orange-700',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          confirmBg: 'bg-orange-600 hover:bg-orange-700',
          icon: '⚠️'
        }
      default:
        return {
          headerBg: 'bg-gradient-to-r from-blue-600 to-blue-700',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          icon: 'ℹ️'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={`${styles.headerBg} text-white p-6`}>
          <div className="flex items-center">
            <div className={`${styles.iconBg} rounded-full p-3 mr-4`}>
              <span className="text-2xl">{styles.icon}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-white/90 text-sm">This action requires confirmation</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <p className="text-gray-700 mb-4 leading-relaxed">{message}</p>
          </div>

          {/* Warning Items */}
          {warningItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                <span className="mr-2">🚨</span>
                Data that will be permanently lost:
              </h4>
              <ul className="space-y-2">
                {warningItems.map((item, index) => (
                  <li key={index} className="text-red-700 text-sm flex items-start">
                    <span className="mr-2 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Typing Confirmation */}
          {requireTyping && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <label className="block text-yellow-800 font-medium mb-2">
                Type "{confirmText}" to confirm:
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder={`Type ${confirmText} here...`}
                disabled={isConfirming}
              />
              <p className="text-yellow-700 text-xs mt-1">
                This helps prevent accidental deletions
              </p>
            </div>
          )}

          {/* Final Warning */}
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
            <p className="text-gray-700 text-sm">
              <strong>⚠️ This action cannot be undone.</strong> Please make sure you want to proceed before confirming.
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button 
            onClick={handleClose}
            disabled={isConfirming}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isConfirming || (requireTyping && userInput !== confirmText)}
            className={`${styles.confirmBg} text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
          >
            {isConfirming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Confirm Removal'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
