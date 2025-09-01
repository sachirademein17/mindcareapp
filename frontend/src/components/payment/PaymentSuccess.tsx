// 📁 frontend/src/components/payment/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PaymentSuccessData } from './PaymentProcessor'

interface PaymentSuccessProps {
  paymentData: PaymentSuccessData
  onContinue?: () => void
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  paymentData,
  onContinue
}) => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(8) // 8 second countdown
  const [autoRedirectEnabled, setAutoRedirectEnabled] = useState(true)

  useEffect(() => {
    if (autoRedirectEnabled && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    } else if (autoRedirectEnabled && countdown === 0) {
      handleContinue()
    }
  }, [countdown, autoRedirectEnabled])

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    } else {
      navigate('/patient/dashboard')
    }
  }

  const stopAutoRedirect = () => {
    setAutoRedirectEnabled(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
        
        {/* Success Animation */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          {/* Confetti effect */}
          <div className="absolute -top-2 -left-2 w-24 h-24 pointer-events-none">
            <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute top-2 right-0 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-0 right-2 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }}></div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎉 Payment Successful!
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Your consultation has been booked successfully
        </p>
        
        {/* Payment Details */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6 text-left">
          <h3 className="font-semibold text-green-900 mb-4 text-center">
            ✅ Payment & Booking Confirmed
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Payment ID:</span>
              <span className="font-mono text-green-900 text-xs">
                {paymentData.paymentIntentId.slice(-12)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-green-700">Meeting ID:</span>
              <span className="font-semibold text-green-900">#{paymentData.meetingId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-green-700">Amount Paid:</span>
              <span className="font-semibold text-green-900">
                ${paymentData.amount.toFixed(2)} {paymentData.currency.toUpperCase()}
              </span>
            </div>
            
            {paymentData.doctorName && (
              <div className="flex justify-between">
                <span className="text-green-700">Doctor:</span>
                <span className="font-semibold text-green-900">{paymentData.doctorName}</span>
              </div>
            )}
            
            {paymentData.meetingDate && (
              <div className="flex justify-between">
                <span className="text-green-700">Date:</span>
                <span className="font-semibold text-green-900">{paymentData.meetingDate}</span>
              </div>
            )}
            
            {paymentData.startTime && (
              <div className="flex justify-between">
                <span className="text-green-700">Time:</span>
                <span className="font-semibold text-green-900">{paymentData.startTime}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <div className="text-xs text-green-800 text-center">
              <strong>Next Step:</strong> Your appointment request has been sent to the doctor. 
              You'll receive a notification once the doctor approves your booking.
            </div>
          </div>
        </div>
        
        {/* Auto-redirect notice */}
        {autoRedirectEnabled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-800 text-center">
              <div className="flex items-center justify-center mb-1">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-semibold">Auto-redirecting to Dashboard</span>
              </div>
              <div className="text-xs">
                Redirecting in <span className="font-bold text-blue-600">{countdown}</span> seconds...
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/patient/meetings')}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            📅 View My Appointments
          </button>
          
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
          >
            🏠 Go to Dashboard
          </button>
          
          {autoRedirectEnabled && (
            <button
              onClick={stopAutoRedirect}
              className="w-full border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel Auto-Redirect
            </button>
          )}
        </div>
        
        {/* Footer note */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            📧 A confirmation email has been sent to your registered email address
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
