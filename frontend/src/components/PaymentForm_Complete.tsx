// 📁 frontend/src/components/PaymentForm.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

interface PaymentFormProps {
  meetingId: number
  amount: number
  currency: string
  onPaymentSuccess: () => void
  onPaymentError: (error: string) => void
  onCancel: () => void
}

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51S0dm9HBA6CHYnL5k2H4t4jh1eMNmZKzfgXRAMRhJPT1h5JU9U9NhRlGN7uuYMxJm7jhZ8N6wg41KJgpU5pzYDFb00ZjBCXmDY')

// Card styling options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
}

// Inner payment form component that uses Stripe hooks
const CheckoutForm: React.FC<{
  meetingId: number
  amount: number
  currency: string
  clientSecret: string
  onPaymentSuccess: () => void
  onPaymentError: (error: string) => void
  onCancel: () => void
}> = ({ meetingId, amount, currency, clientSecret, onPaymentSuccess, onPaymentError, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null)
    setCardComplete(event.complete)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      return
    }

    setProcessing(true)
    setCardError(null)

    try {
      console.log('🔄 Processing payment with clientSecret:', clientSecret)

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Mental Health Patient', // You can collect this from user if needed
          },
        },
      })

      if (error) {
        console.error('❌ Payment failed:', error)
        setCardError(error.message || 'Payment failed')
        onPaymentError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent)
        
        // Call backend to confirm the payment and update meeting status
        try {
          const response = await axios.post(
            `http://localhost:5000/api/meetings/${meetingId}/confirm-payment`,
            {
              paymentIntentId: paymentIntent.id
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
            }
          )
          
          console.log('✅ Payment confirmed on backend:', response.data)
          onPaymentSuccess()
        } catch (confirmError) {
          console.error('❌ Error confirming payment on backend:', confirmError)
          onPaymentError('Payment succeeded but confirmation failed. Please contact support.')
        }
      }
    } catch (err: any) {
      console.error('❌ Payment processing error:', err)
      setCardError('An unexpected error occurred')
      onPaymentError('An unexpected error occurred')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          💳 Secure Payment
        </h2>
        <div className="text-lg text-gray-600">
          <span className="font-semibold text-blue-600">
            ${Number(amount).toFixed(2)} {currency.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Payment for consultation session
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💳 Card Details
          </label>
          <div className="border border-gray-300 rounded-xl p-4 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <CardElement 
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {cardError}
            </p>
          )}
        </div>

        {/* Test Cards Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center text-blue-800 mb-2">
            <span className="mr-2">🧪</span>
            <span className="font-semibold text-sm">Test Card Numbers</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Visa:</strong> 4242 4242 4242 4242</div>
            <div><strong>Visa (Debit):</strong> 4000 0566 5566 5556</div>
            <div><strong>Mastercard:</strong> 5555 5555 5555 4444</div>
            <div><strong>Exp:</strong> Any future date (e.g., 12/34)</div>
            <div><strong>CVC:</strong> Any 3 digits (e.g., 123)</div>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="space-y-4">
          <button
            type="submit"
            disabled={!stripe || processing || !cardComplete}
            className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${
              !stripe || processing || !cardComplete
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {processing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              `💳 Pay $${Number(amount).toFixed(2)}`
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel Payment
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-sm text-green-800">
            <div className="font-semibold">🔒 Secure Payment Processing</div>
            <div className="mt-1">
              All payments are processed securely through Stripe with bank-level encryption.
              Your card details are never stored on our servers.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main PaymentForm component
const PaymentForm: React.FC<PaymentFormProps> = ({
  meetingId,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}) => {
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        console.log('🚀 Creating payment intent for meetingId:', meetingId)
        
        const response = await axios.post(
          `http://localhost:5000/api/meetings/${meetingId}/payment-intent`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }
        )

        console.log('✅ Payment intent created successfully:', response.data)
        setClientSecret(response.data.clientSecret)
        setLoading(false)
      } catch (err: any) {
        console.error('❌ Error creating payment intent:', err)
        console.error('Error response:', err.response?.data)
        setError(err.response?.data?.error || 'Failed to initialize payment')
        setLoading(false)
        onPaymentError(err.response?.data?.error || 'Failed to initialize payment')
      }
    }

    createPaymentIntent()
  }, [meetingId, onPaymentError])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Initializing payment...</span>
        </div>
      </div>
    )
  }

  if (error && !clientSecret) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Initialization Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onCancel}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-gray-600">Setting up payment...</p>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        meetingId={meetingId}
        amount={amount}
        currency={currency}
        clientSecret={clientSecret}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        onCancel={onCancel}
      />
    </Elements>
  )
}

export default PaymentForm
