// 📁 frontend/src/pages/PaymentResult_NEW.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

interface PaymentResultData {
  success: boolean
  message: string
  meetingId?: string
  paymentIntentId?: string
  amount?: number
  currency?: string
  doctorName?: string
  meetingDate?: string
  startTime?: string
  error?: string
}

const PaymentResult: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(10)
  const [autoRedirectEnabled, setAutoRedirectEnabled] = useState(true)
  const [result, setResult] = useState<PaymentResultData | null>(null)

  useEffect(() => {
    // Check payment result from multiple sources
    checkPaymentResult()
  }, [location.state, searchParams])

  // Auto-redirect countdown for successful payments
  useEffect(() => {
    if (result?.success && autoRedirectEnabled && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    } else if (result?.success && autoRedirectEnabled && countdown === 0) {
      navigate('/patient/dashboard')
    }
  }, [result, countdown, autoRedirectEnabled, navigate])

  const checkPaymentResult = async () => {
    try {
      setLoading(true)

      // Priority 1: Check navigation state (from new payment flow)
      if (location.state && typeof location.state.success === 'boolean') {
        console.log('✅ Using payment result from navigation state')
        setResult({
          success: location.state.success,
          message: location.state.message || getDefaultMessage(location.state.success),
          meetingId: location.state.meetingId,
          paymentIntentId: location.state.paymentIntentId,
          amount: location.state.amount,
          currency: location.state.currency || 'USD',
          doctorName: location.state.doctorName,
          meetingDate: location.state.meetingDate,
          startTime: location.state.startTime
        })
        setLoading(false)
        return
      }

      // Priority 2: Check URL parameters (legacy flow)
      const redirectStatus = searchParams.get('redirect_status')
      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')
      const meetingId = searchParams.get('meeting_id')

      if (redirectStatus || paymentIntentClientSecret) {
        await handleLegacyPaymentResult(redirectStatus, paymentIntentClientSecret, meetingId)
        return
      }

      // Priority 3: No payment data found
      setResult({
        success: false,
        message: 'No payment information found. Please try again.',
        error: 'INVALID_SESSION'
      })
    } catch (error: any) {
      console.error('❌ Error checking payment result:', error)
      setResult({
        success: false,
        message: 'Unable to verify payment status. Please contact support.',
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLegacyPaymentResult = async (
    redirectStatus: string | null,
    paymentIntentClientSecret: string | null,
    meetingId: string | null
  ) => {
    if (!paymentIntentClientSecret || !meetingId) {
      setResult({
        success: false,
        message: 'Invalid payment session. Missing required parameters.',
        error: 'MISSING_PARAMETERS'
      })
      return
    }

    try {
      // Check payment status from backend
      const response = await fetch(
        `${API_BASE_URL}/api/meetings/${meetingId}/payment-status`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check payment status')
      }

      if (redirectStatus === 'succeeded' && data.payment?.status === 'succeeded') {
        setResult({
          success: true,
          message: 'Payment successful! Your consultation has been booked.',
          meetingId,
          paymentIntentId: data.payment.stripePaymentIntentId,
          amount: data.payment.amount,
          currency: data.payment.currency,
          doctorName: data.meeting?.Doctor?.name,
          meetingDate: data.meeting?.meetingDate,
          startTime: data.meeting?.startTime
        })
      } else {
        setResult({
          success: false,
          message: 'Payment was not completed successfully. Please try again.',
          error: 'PAYMENT_NOT_COMPLETED'
        })
      }
    } catch (error: any) {
      console.error('❌ Error verifying legacy payment:', error)
      setResult({
        success: false,
        message: 'Unable to verify payment status. Please contact support.',
        error: error.message
      })
    }
  }

  const getDefaultMessage = (success: boolean): string => {
    return success
      ? '🎉 Congratulations! Your payment has been processed successfully.'
      : '❌ Payment was not completed. Please try again.'
  }

  const stopAutoRedirect = () => {
    setAutoRedirectEnabled(false)
  }

  const handleRetryPayment = () => {
    navigate('/patient/dashboard')
  }

  const handleViewMeetings = () => {
    navigate('/patient/meetings')
  }

  const handleGoToDashboard = () => {
    navigate('/patient/dashboard')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment status
          </p>
        </div>
      </div>
    )
  }

  // No result state
  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Unable to Load Payment Status
          </h2>
          <p className="text-gray-600 mb-6">
            Something went wrong while checking your payment. Please try again.
          </p>
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (result.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center relative overflow-hidden">
          {/* Success header decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
          
          {/* Success animation */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-28 h-28 pointer-events-none">
              <div className="absolute top-0 left-0 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="absolute top-3 right-0 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute bottom-3 left-3 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }}></div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            🎉 Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {result.message}
          </p>
          
          {/* Payment details */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-green-900 mb-4 text-center">
              ✅ Payment & Booking Confirmed
            </h3>
            
            <div className="space-y-3 text-sm">
              {result.paymentIntentId && (
                <div className="flex justify-between">
                  <span className="text-green-700">Payment ID:</span>
                  <span className="font-mono text-green-900 text-xs">
                    {result.paymentIntentId.slice(-12)}
                  </span>
                </div>
              )}
              
              {result.meetingId && (
                <div className="flex justify-between">
                  <span className="text-green-700">Meeting ID:</span>
                  <span className="font-semibold text-green-900">#{result.meetingId}</span>
                </div>
              )}
              
              {result.amount && (
                <div className="flex justify-between">
                  <span className="text-green-700">Amount Paid:</span>
                  <span className="font-semibold text-green-900">
                    ${result.amount.toFixed(2)} {result.currency?.toUpperCase()}
                  </span>
                </div>
              )}
              
              {result.doctorName && (
                <div className="flex justify-between">
                  <span className="text-green-700">Doctor:</span>
                  <span className="font-semibold text-green-900">{result.doctorName}</span>
                </div>
              )}
              
              {result.meetingDate && (
                <div className="flex justify-between">
                  <span className="text-green-700">Date:</span>
                  <span className="font-semibold text-green-900">{result.meetingDate}</span>
                </div>
              )}
              
              {result.startTime && (
                <div className="flex justify-between">
                  <span className="text-green-700">Time:</span>
                  <span className="font-semibold text-green-900">{result.startTime}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <div className="text-xs text-green-800 text-center">
                <strong>Next Step:</strong> Your appointment request has been sent to the doctor. 
                You'll receive a notification once approved.
              </div>
            </div>
          </div>
          
          {/* Auto-redirect countdown */}
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
          
          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleViewMeetings}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              📅 View My Appointments
            </button>
            
            <button
              onClick={handleGoToDashboard}
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
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              📧 A confirmation email has been sent to your registered email address
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error/Failure state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ❌ Payment Not Completed
        </h1>
        
        <p className="text-gray-600 mb-6">
          {result.message}
        </p>
        
        {/* Error details */}
        {result.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-red-800">
              <div className="font-semibold">Error Details:</div>
              <div className="mt-1 font-mono text-xs">{result.error}</div>
            </div>
          </div>
        )}
        
        {/* Help section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="text-sm text-yellow-800">
            <div className="font-semibold">What to do next:</div>
            <div className="mt-1 text-left">
              • Check your internet connection<br/>
              • Verify your payment method<br/>
              • Try the payment again<br/>
              • Contact support if the issue persists
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetryPayment}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            🔄 Try Again
          </button>
          
          <button
            onClick={handleGoToDashboard}
            className="w-full border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
          >
            🏠 Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentResult
