// 📁 frontend/src/components/payment/PaymentForm.tsx
import React, { useState } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement
} from '@stripe/react-stripe-js'

interface PaymentFormProps {
  meetingId: number
  amount: number
  currency: string
  doctorName: string
  meetingDate: string
  startTime: string
  onSuccess: (paymentData: { paymentIntentId: string; meetingId: number }) => void
  onError: (error: string) => void
  onCancel: () => void
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  meetingId,
  amount,
  currency,
  doctorName,
  meetingDate,
  startTime,
  onSuccess,
  onError,
  onCancel
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ensure amount is always a number
  const numericAmount = Number(amount) || 0

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Confirm the payment with the payment element
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      })

      if (stripeError) {
        if (stripeError.type === 'card_error' || stripeError.type === 'validation_error') {
          setError(stripeError.message || 'Payment failed. Please check your card details.')
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
        onError(stripeError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess({ paymentIntentId: paymentIntent.id, meetingId })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      {/* Payment Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Summary</h3>
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
            <span className="font-medium">{startTime}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-gray-600">Consultation Fee:</span>
            <span className="font-bold text-lg">
              {currency.toUpperCase()} {numericAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Information
          </label>
          <div className="border rounded-md p-3">
            <PaymentElement
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['card'],
              }}
            />
          </div>
        </div>

        {/* Address Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Billing Address
          </label>
          <div className="border rounded-md p-3">
            <AddressElement
              options={{
                mode: 'billing',
                allowedCountries: ['US', 'CA', 'GB', 'AU'],
              }}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              `Pay ${currency.toUpperCase()} ${numericAmount.toFixed(2)}`
            )}
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <div className="flex items-center justify-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Your payment information is secure and encrypted</span>
        </div>
        <div className="mt-1">
          Powered by Stripe • PCI DSS Level 1 Compliant
        </div>
      </div>
    </div>
  )
}

export default PaymentForm
