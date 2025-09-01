// 📁 frontend/src/components/PaymentModal.tsx
import React, { useState } from 'react'
import PaymentForm from './PaymentForm'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  meetingId: number
  meetingDetails: {
    doctorName: string
    date: string
    time: string
    amount: number
  }
  onPaymentSuccess: (paymentId: number) => void
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  meetingDetails,
  onPaymentSuccess
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'form' | 'success' | 'error'>('form')
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const handlePaymentSuccess = (paymentId: number) => {
    setPaymentStatus('success')
    setTimeout(() => {
      onPaymentSuccess(paymentId)
      onClose()
    }, 2000) // Show success for 2 seconds
  }

  const handlePaymentError = (error: string) => {
    setErrorMessage(error)
    setPaymentStatus('error')
  }

  const handleRetry = () => {
    setPaymentStatus('form')
    setErrorMessage('')
  }

  const renderContent = () => {
    switch (paymentStatus) {
      case 'success':
        return (
          <div className="text-center p-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                Your meeting has been booked and payment processed successfully.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  You will receive a confirmation notification once the doctor approves your meeting.
                </p>
              </div>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center p-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <PaymentForm
            meetingId={meetingId}
            amount={meetingDetails.amount}
            doctorName={meetingDetails.doctorName}
            meetingDate={meetingDetails.date}
            meetingTime={meetingDetails.time}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCancel={onClose}
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {paymentStatus === 'form' ? 'Complete Payment' : 
             paymentStatus === 'success' ? 'Payment Complete' : 'Payment Error'}
          </h2>
          {paymentStatus !== 'success' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
