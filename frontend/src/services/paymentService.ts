// 📁 frontend/src/services/paymentService.ts
import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

// Simple auth utility
const getAuthToken = (): string | null => {
  return localStorage.getItem('token')
}

// Payment interfaces
export interface PaymentIntent {
  id: number
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
  status: string
}

export interface PaymentDetails {
  id: number
  meetingId: number
  patientId: number
  doctorId: number
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  paymentMethod: string
  paymentDate?: string
  refundDate?: string
  refundAmount?: number
  refundReason?: string
  stripePaymentIntentId?: string
  stripeRefundId?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentRequest {
  meetingId: number
}

export interface ConfirmPaymentRequest {
  paymentId: number
  paymentIntentId: string
}

class PaymentService {
  private getAuthHeaders() {
    const token = getAuthToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  /**
   * Get Stripe publishable key
   */
  async getStripePublicKey(): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE}/payments/stripe/public-key`)
      return response.data.publicKey
    } catch (error) {
      console.error('Error getting Stripe public key:', error)
      throw new Error('Failed to get Stripe configuration')
    }
  }

  /**
   * Create payment intent for meeting
   */
  async createPaymentIntent(meetingId: number): Promise<PaymentIntent> {
    try {
      const response = await axios.post(
        `${API_BASE}/payments/create-intent`,
        { meetingId },
        { headers: this.getAuthHeaders() }
      )

      if (response.data.success) {
        return {
          id: response.data.payment.id,
          clientSecret: response.data.clientSecret,
          paymentIntentId: response.data.paymentIntentId,
          amount: response.data.payment.amount,
          currency: response.data.payment.currency,
          status: response.data.payment.status
        }
      } else {
        throw new Error('Failed to create payment intent')
      }
    } catch (error: any) {
      console.error('Error creating payment intent:', error)
      throw new Error(error.response?.data?.error || 'Failed to create payment intent')
    }
  }

  /**
   * Confirm payment completion
   */
  async confirmPayment(paymentId: number, paymentIntentId: string): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE}/payments/confirm`,
        { paymentId, paymentIntentId },
        { headers: this.getAuthHeaders() }
      )

      return response.data
    } catch (error: any) {
      console.error('Error confirming payment:', error)
      throw new Error(error.response?.data?.error || 'Failed to confirm payment')
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: number): Promise<PaymentDetails> {
    try {
      const response = await axios.get(
        `${API_BASE}/payments/${paymentId}`,
        { headers: this.getAuthHeaders() }
      )

      if (response.data.success) {
        return response.data.payment
      } else {
        throw new Error('Payment not found')
      }
    } catch (error: any) {
      console.error('Error getting payment details:', error)
      throw new Error(error.response?.data?.error || 'Failed to get payment details')
    }
  }

  /**
   * Get user payments (for patients and doctors)
   */
  async getUserPayments(): Promise<PaymentDetails[]> {
    try {
      const response = await axios.get(
        `${API_BASE}/payments/user`,
        { headers: this.getAuthHeaders() }
      )

      if (response.data.success) {
        return response.data.payments
      } else {
        return []
      }
    } catch (error: any) {
      console.error('Error getting user payments:', error)
      throw new Error(error.response?.data?.error || 'Failed to get payments')
    }
  }

  /**
   * Request refund (for cancellations)
   */
  async requestRefund(meetingId: number, reason: string): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE}/payments/refund`,
        { meetingId, reason },
        { headers: this.getAuthHeaders() }
      )

      return response.data
    } catch (error: any) {
      console.error('Error requesting refund:', error)
      throw new Error(error.response?.data?.error || 'Failed to request refund')
    }
  }

  /**
   * Format currency amount for display
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  /**
   * Get payment status color for UI
   */
  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
      case 'cancelled':
        return 'text-red-600'
      case 'refunded':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  /**
   * Get payment status display text
   */
  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      case 'refunded':
        return 'Refunded'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }
}

export const paymentService = new PaymentService()
export default paymentService
