// 📁 frontend/src/components/PaymentForm.tsx
import React, { useState, useEffect } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { paymentService } from '../services/paymentService'

interface PaymentFormProps {
  meetingId: number
  amount: number
  doctorName: string
  meetingDate: string
  meetingTime: string
  onPaymentSuccess: (paymentId: number) => void
  onPaymentError: (error: string) => void
  onCancel: () => void
}

// Payment form component
const PaymentFormContent: React.FC<PaymentFormProps> = ({
  meetingId,
  amount,
  doctorName,
  meetingDate,
  meetingTime,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/patient/meetings`,
        },
        redirect: 'if_required'
      })

      if (error) {
        onPaymentError(error.message || 'Payment failed')
      } else {
        // Payment succeeded, we can call our backend to confirm
        onPaymentSuccess(meetingId)
      }
    } catch (error: any) {
      onPaymentError(error.message || 'Payment processing failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* Meeting Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          💳 Payment Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Doctor:</span>
            <span className="font-medium">{doctorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{meetingDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{meetingTime}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-green-600">
              {paymentService.formatCurrency(amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border rounded-lg p-4 bg-gray-50">
          <PaymentElement 
            options={{
              layout: 'tabs'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ${paymentService.formatCurrency(amount)}`
            )}
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center text-xs text-gray-500">
          <span className="mr-2">🔒</span>
          <span>
            Your payment information is securely processed by Stripe.
            We never store your payment details.
          </span>
        </div>
      </div>
    </div>
  )
}

// Main payment wrapper component
const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string>('')

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const publicKey = await paymentService.getStripePublicKey()
        setStripePromise(loadStripe(publicKey))
      } catch (error) {
        console.error('Error initializing Stripe:', error)
        props.onPaymentError('Failed to initialize payment system')
      }
    }

    initializeStripe()
  }, [])

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!stripePromise) return
      
      try {
        const intent = await paymentService.createPaymentIntent(props.meetingId)
        setClientSecret(intent.clientSecret)
      } catch (error: any) {
        console.error('Error creating payment intent:', error)
        props.onPaymentError(error.message)
      }
    }

    createPaymentIntent()
  }, [stripePromise, props.meetingId])

  if (!stripePromise || !clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading payment system...</span>
      </div>
    )
  }

  return (
    <Elements 
      stripe={stripePromise}
      options={{
        clientSecret: clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
          }
        }
      }}
    >
      <PaymentFormContent {...props} />
    </Elements>
  )
}

export default PaymentForm
