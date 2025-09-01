// 📁 backend/src/services/StripeService.ts
import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

export class StripeService {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    })
  }

  /**
   * Create a payment intent for meeting booking
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: { [key: string]: string } = {}
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          ...metadata,
          platform: 'mindcare',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw new Error('Failed to create payment intent')
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      })

      return paymentIntent
    } catch (error) {
      console.error('Error confirming payment intent:', error)
      throw new Error('Failed to confirm payment')
    }
  }

  /**
   * Create a full refund for a payment
   */
  async createRefund(
    paymentIntentId: string,
    reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer',
    metadata: { [key: string]: string } = {}
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason,
        metadata: {
          ...metadata,
          platform: 'mindcare',
        },
      })

      return refund
    } catch (error) {
      console.error('Error creating refund:', error)
      throw new Error('Failed to create refund')
    }
  }

  /**
   * Create a partial refund
   */
  async createPartialRefund(
    paymentIntentId: string,
    amount: number,
    reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer',
    metadata: { [key: string]: string } = {}
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
        reason,
        metadata: {
          ...metadata,
          platform: 'mindcare',
        },
      })

      return refund
    } catch (error) {
      console.error('Error creating partial refund:', error)
      throw new Error('Failed to create partial refund')
    }
  }

  /**
   * Get payment intent details
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
      throw new Error('Failed to retrieve payment intent')
    }
  }

  /**
   * Get refund details
   */
  async getRefund(refundId: string): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.retrieve(refundId)
      return refund
    } catch (error) {
      console.error('Error retrieving refund:', error)
      throw new Error('Failed to retrieve refund')
    }
  }

  /**
   * Create or retrieve a customer
   */
  async createCustomer(
    email: string,
    name: string,
    metadata: { [key: string]: string } = {}
  ): Promise<Stripe.Customer> {
    try {
      // Check if customer already exists
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0]
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          ...metadata,
          platform: 'mindcare',
        },
      })

      return customer
    } catch (error) {
      console.error('Error creating/retrieving customer:', error)
      throw new Error('Failed to create customer')
    }
  }

  /**
   * Get customer payment methods
   */
  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      })

      return paymentMethods.data
    } catch (error) {
      console.error('Error retrieving customer payment methods:', error)
      throw new Error('Failed to retrieve payment methods')
    }
  }

  /**
   * Calculate platform fee (5% of total amount)
   */
  calculatePlatformFee(amount: number): number {
    const feePercentage = 0.05 // 5%
    return Math.round(amount * feePercentage * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Calculate doctor earnings after platform fee
   */
  calculateDoctorEarnings(amount: number): number {
    const platformFee = this.calculatePlatformFee(amount)
    return amount - platformFee
  }

  /**
   * Handle webhook events
   */
  constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
      }

      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (error) {
      console.error('Error constructing webhook event:', error)
      throw new Error('Invalid webhook signature')
    }
  }
}

export const stripeService = new StripeService()
