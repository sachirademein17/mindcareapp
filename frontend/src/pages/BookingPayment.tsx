// 📁 frontend/src/pages/BookingPayment.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import { PaymentProcessor } from '../components/payment'

interface BookingDetails {
  meetingId: number
  doctorName: string
  specialization: string
  consultationFee: number
  meetingDate: string
  startTime: string
  endTime: string
  status: string
  paymentData?: any
  message?: string
}

const BookingPayment: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  const meetingId = searchParams.get('meeting_id') || location.state?.meetingId

  useEffect(() => {
    if (!meetingId) {
      setError('Invalid booking session')
      setLoading(false)
      return
    }

    // Check if we have booking details from navigation state (new flow)
    if (location.state && location.state.meetingId) {
      console.log('📋 Using booking details from navigation state')
      setBookingDetails({
        meetingId: location.state.meetingId,
        doctorName: location.state.doctorName,
        specialization: location.state.specialization,
        consultationFee: location.state.consultationFee,
        meetingDate: location.state.meetingDate,
        startTime: location.state.startTime,
        endTime: location.state.endTime,
        status: 'payment_pending',
        paymentData: location.state.paymentData,
        message: location.state.message
      })
      setShowPayment(true)
      setLoading(false)
    } else {
      // Fallback to old flow: fetch booking details from API
      fetchBookingDetails()
    }
  }, [meetingId, location.state])

  const fetchBookingDetails = async () => {
    try {
      // Get meeting details
      const response = await axios.get(
        `http://localhost:5001/api/meetings/patient`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const meeting = response.data.meetings.find((m: any) => m.id === parseInt(meetingId!))
      
      if (!meeting) {
        setError('Meeting not found')
        setLoading(false)
        return
      }

      setBookingDetails({
        meetingId: meeting.id,
        doctorName: meeting.Doctor?.name || 'Unknown Doctor',
        specialization: meeting.Doctor?.DoctorDetail?.specialization || 'General',
        consultationFee: meeting.consultationFee,
        meetingDate: meeting.meetingDate,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        status: meeting.status
      })

      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching booking details:', err)
      setError('Failed to load booking details')
      setLoading(false)
    }
  }

  const handleProceedToPayment = () => {
    setShowPayment(true)
  }

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      console.log('✅ Payment successful! Payment data:', paymentData)
      
      // Navigate to success page with comprehensive payment and booking details
      navigate('/payment/success', {
        state: {
          success: true,
          meetingId: paymentData.meetingId || meetingId,
          paymentIntentId: paymentData.paymentIntentId,
          message: '🎉 Congratulations! Your payment has been processed successfully and your appointment request has been sent to the doctor for approval.',
          doctorName: bookingDetails?.doctorName,
          meetingDate: bookingDetails?.meetingDate,
          startTime: bookingDetails?.startTime,
          amount: paymentData.amount || bookingDetails?.consultationFee,
          currency: paymentData.currency || 'USD'
        }
      })
    } catch (error) {
      console.error('❌ Error navigating after payment:', error)
      // Fallback navigation
      navigate('/patient/dashboard')
    }
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    setShowPayment(false)
  }

  const handleCancel = () => {
    if (showPayment) {
      setShowPayment(false)
    } else {
      navigate('/patient/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Booking Details...
          </h2>
        </div>
      </div>
    )
  }

  if (error && !bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (showPayment && bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
        <PaymentProcessor
          meetingId={bookingDetails.meetingId}
          amount={Number(bookingDetails.consultationFee)}
          currency="USD"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📅 Booking Confirmation
          </h1>
          <p className="text-gray-600">
            {bookingDetails?.message || 'Please review your appointment details and proceed to payment'}
          </p>
          {bookingDetails?.status === 'payment_pending' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-center text-blue-800 mb-2">
                <span className="mr-2">💳</span>
                <span className="font-semibold">Payment Required</span>
              </div>
              <p className="text-sm text-blue-700">
                Complete your payment to send the appointment request to the doctor for approval.
              </p>
            </div>
          )}
        </div>

        {bookingDetails && (
          <>
            {/* Booking Details Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    👨‍⚕️ Doctor Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {bookingDetails.doctorName}</div>
                    <div><span className="font-medium">Specialization:</span> {bookingDetails.specialization}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🕐 Appointment Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Date:</span> {bookingDetails.meetingDate}</div>
                    <div><span className="font-medium">Time:</span> {bookingDetails.startTime} - {bookingDetails.endTime}</div>
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        bookingDetails.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {bookingDetails.status.charAt(0).toUpperCase() + bookingDetails.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-lg">💰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Payment Summary
                </h3>
              </div>
              
              {/* Consultation Details */}
              <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Consultation Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">👨‍⚕️ Doctor:</span>
                    <span className="font-medium text-gray-900">{bookingDetails.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">🏥 Specialization:</span>
                    <span className="font-medium text-gray-900">{bookingDetails.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">📅 Date & Time:</span>
                    <span className="font-medium text-gray-900">
                      {bookingDetails.meetingDate} at {bookingDetails.startTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">⏱️ Duration:</span>
                    <span className="font-medium text-gray-900">1 hour session</span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Payment Structure
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3">
                    <div>
                      <span className="text-gray-700 font-medium">Doctor's Consultation Fee</span>
                      <p className="text-xs text-gray-500">Full session value (paid separately to doctor)</p>
                    </div>
                    <span className="font-semibold text-gray-900">${Number(bookingDetails.consultationFee).toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between items-center mb-1 bg-blue-50 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-blue-700 font-semibold">Platform Service Fee (15%)</span>
                        <p className="text-xs text-blue-600">What you pay now via Stripe</p>
                        <p className="text-xs text-gray-500">Secure platform, scheduling & support</p>
                      </div>
                      <span className="text-lg font-bold text-blue-700">
                        ${(Number(bookingDetails.consultationFee) * 0.15).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                      <span>• Doctor receives directly from you:</span>
                      <span className="font-medium">${(Number(bookingDetails.consultationFee) * 0.85).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t-2 border-blue-200 pt-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-blue-600">You Pay Now (Stripe)</span>
                        <p className="text-xs text-green-600 font-medium">✓ Platform service fee only</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          ${(Number(bookingDetails.consultationFee) * 0.15).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">USD</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <div className="flex items-start">
                  <span className="text-amber-600 mr-2 mt-0.5">💡</span>
                  <div className="text-sm">
                    <p className="text-amber-800 font-medium mb-1">Payment Method:</p>
                    <ul className="text-amber-700 text-xs space-y-1">
                      <li>• <strong>Platform Fee (${(Number(bookingDetails.consultationFee) * 0.15).toFixed(2)}):</strong> Paid now via Stripe</li>
                      <li>• <strong>Doctor Fee (${(Number(bookingDetails.consultationFee) * 0.85).toFixed(2)}):</strong> Paid directly to doctor after session</li>
                      <li>• This reduces your upfront payment to just the platform service fee</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 mt-0.5">ℹ️</span>
                  <div className="text-sm">
                    <p className="text-green-800 font-medium mb-1">What's included:</p>
                    <ul className="text-green-700 text-xs space-y-1">
                      <li>• Secure video consultation platform</li>
                      <li>• Session recording & notes (if needed)</li>
                      <li>• 24/7 customer support</li>
                      <li>• Full refund if doctor cancels</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel Booking
              </button>
              
              <button
                onClick={handleProceedToPayment}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Proceed to Payment
              </button>
            </div>

            {/* Payment Security Notice */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-sm text-green-800">
                  <div className="font-semibold">🔒 Secure Payment</div>
                  <div className="mt-1">
                    Your payment is protected by Stripe's bank-level security. 
                    We never store your card details on our servers.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BookingPayment
