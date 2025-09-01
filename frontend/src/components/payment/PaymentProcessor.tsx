// 📁 frontend/src/components/payment/PaymentProcessor.tsx
import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from './PaymentForm'
import { API_BASE_URL } from '../../config/api'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!)

interface PaymentProcessorProps {
  meetingId: number
  amount: number
  currency?: string
  doctorName?: string
  meetingDate?: string
  startTime?: string
  onSuccess: (paymentData: PaymentSuccessData) => void
  onError: (error: string) => void
  onCancel: () => void
}

export interface PaymentSuccessData {
  paymentIntentId: string
  meetingId: number
  amount: number
  currency: string
  status: 'succeeded'
  doctorName?: string
  meetingDate?: string
  startTime?: string
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  meetingId,
  amount,
  currency = 'USD',
  doctorName,
  meetingDate,
  startTime,
  onSuccess,
  onError,
  onCancel
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createPaymentIntent()
  }, [meetingId, amount])

  const createPaymentIntent = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Creating payment intent for meeting:', meetingId)

      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment intent')
      }

      if (!data.clientSecret) {
        throw new Error('No client secret received')
      }

      setClientSecret(data.clientSecret)
      console.log('✅ Payment intent created successfully')
    } catch (err: any) {
      console.error('❌ Error creating payment intent:', err)
      setError(err.message || 'Failed to initialize payment')
      onError(err.message || 'Failed to initialize payment')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (paymentData: PaymentSuccessData) => {
    console.log('✅ Payment successful:', paymentData)
    onSuccess({
      ...paymentData,
      doctorName,
      meetingDate,
      startTime
    })
  }

  const handlePaymentError = (errorMessage: string) => {
    console.error('❌ Payment error:', errorMessage)
    setError(errorMessage)
    onError(errorMessage)
  }

  const stripeOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px'
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Initializing Payment...
          </h3>
          <p className="text-gray-600">
            Setting up secure payment processing
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Setup Failed
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={createPaymentIntent}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onCancel}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Unavailable
          </h3>
          <p className="text-gray-600 mb-6">
            Unable to initialize payment system. Please try again.
          </p>
          <button
            onClick={onCancel}
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <PaymentForm
        meetingId={meetingId}
        amount={amount}
        currency={currency}
        doctorName={doctorName}
        meetingDate={meetingDate}
        startTime={startTime}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={onCancel}
      />
    </Elements>
  )
}

export default PaymentProcessor
