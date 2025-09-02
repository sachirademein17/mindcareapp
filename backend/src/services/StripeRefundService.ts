/**
 * 🔄 Stripe Refund Service
 * 
 * Handles actual Stripe API refund processing using official Stripe APIs
 * Reference: https://docs.stripe.com/api/refunds
 */

import Stripe from 'stripe'
import { Meeting } from '../models/Meeting'
import { User } from '../models/User'
import { NotificationService } from './NotificationService'

export class StripeRefundService {
  private stripe: Stripe

  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }
    
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil' // Latest API version
    })
  }

  /**
   * 💰 Create a Stripe refund using POST /v1/refunds
   * 
   * @param paymentIntentId - The Stripe payment intent ID
   * @param amount - Amount to refund in cents (optional, full refund if not specified)
   * @param reason - Reason for refund ('duplicate', 'fraudulent', 'requested_by_customer')
   * @param meetingId - Meeting ID for tracking
   * @returns Stripe refund object
   */
  async createRefund(
    paymentIntentId: string, 
    amount?: number, 
    reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer',
    meetingId?: number
  ): Promise<Stripe.Refund> {
    try {
      console.log(`🔄 Creating Stripe refund for payment: ${paymentIntentId}`)
      
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason: reason,
        metadata: {
          meetingId: meetingId?.toString() || '',
          refundedBy: 'system',
          refundDate: new Date().toISOString()
        }
      }

      // Add amount if partial refund
      if (amount) {
        refundParams.amount = Math.round(amount * 100) // Convert to cents
      }

      // Create refund via Stripe API
      const refund = await this.stripe.refunds.create(refundParams)
      
      console.log(`✅ Stripe refund created: ${refund.id}`)
      console.log(`💰 Amount: $${(refund.amount || 0) / 100}`)
      console.log(`📊 Status: ${refund.status}`)
      
      return refund

    } catch (error: any) {
      console.error('❌ Stripe refund failed:', error.message)
      throw new Error(`Stripe refund failed: ${error.message}`)
    }
  }

  /**
   * 📋 Retrieve refund details using GET /v1/refunds/:id
   * 
   * @param refundId - Stripe refund ID
   * @returns Stripe refund object
   */
  async getRefund(refundId: string): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.retrieve(refundId)
      return refund
    } catch (error: any) {
      console.error('❌ Failed to retrieve refund:', error.message)
      throw new Error(`Failed to retrieve refund: ${error.message}`)
    }
  }

  /**
   * 📜 List all refunds using GET /v1/refunds
   * 
   * @param limit - Number of refunds to retrieve (default 10)
   * @param startingAfter - Pagination cursor
   * @returns List of Stripe refunds
   */
  async listRefunds(limit: number = 10, startingAfter?: string): Promise<Stripe.ApiList<Stripe.Refund>> {
    try {
      const params: Stripe.RefundListParams = { limit }
      if (startingAfter) {
        params.starting_after = startingAfter
      }

      const refunds = await this.stripe.refunds.list(params)
      return refunds
    } catch (error: any) {
      console.error('❌ Failed to list refunds:', error.message)
      throw new Error(`Failed to list refunds: ${error.message}`)
    }
  }

  /**
   * 🔄 Update refund metadata using POST /v1/refunds/:id
   * 
   * @param refundId - Stripe refund ID
   * @param metadata - Metadata to update
   * @returns Updated Stripe refund object
   */
  async updateRefund(refundId: string, metadata: Record<string, string>): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.update(refundId, { metadata })
      return refund
    } catch (error: any) {
      console.error('❌ Failed to update refund:', error.message)
      throw new Error(`Failed to update refund: ${error.message}`)
    }
  }

  /**
   * ❌ Cancel a pending refund using POST /v1/refunds/:id/cancel
   * 
   * @param refundId - Stripe refund ID
   * @returns Cancelled Stripe refund object
   */
  async cancelRefund(refundId: string): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.cancel(refundId)
      console.log(`🚫 Refund cancelled: ${refund.id}`)
      return refund
    } catch (error: any) {
      console.error('❌ Failed to cancel refund:', error.message)
      throw new Error(`Failed to cancel refund: ${error.message}`)
    }
  }

  /**
   * 🎯 Process doctor decline refund
   * 
   * @param meetingId - Meeting ID
   * @returns Refund processing result
   */
  async processDoctorDeclineRefund(meetingId: number): Promise<{
    success: boolean
    refund?: Stripe.Refund
    refundAmount: number
    message: string
  }> {
    try {
      console.log(`🔄 Processing doctor decline refund for meeting ${meetingId}`)

      // Get meeting with payment details
      const meeting = await Meeting.findByPk(meetingId, {
        include: [
          { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
        ]
      })

      if (!meeting) {
        throw new Error('Meeting not found')
      }

      if (!meeting.stripePaymentIntentId) {
        throw new Error('No Stripe payment intent found for this meeting')
      }

      if (meeting.paymentStatus === 'refunded') {
        return {
          success: false,
          refundAmount: meeting.refundAmount || 0,
          message: 'Meeting already refunded'
        }
      }

      // Create full refund via Stripe API
      const refund = await this.createRefund(
        meeting.stripePaymentIntentId,
        undefined, // Full refund
        'requested_by_customer',
        meetingId
      )

      // Update meeting with refund details
      await meeting.update({
        status: 'declined',
        paymentStatus: 'refunded',
        refundAmount: (refund.amount || 0) / 100, // Convert from cents
        refundDate: new Date(),
        refundReason: 'Doctor declined meeting',
        refundType: 'full',
        refundProcessed: true,
        stripeRefundId: refund.id
      })

      // Send notification to patient
      const notificationService = new NotificationService()
      await notificationService.createRefundNotification(
        meeting.patientId,
        0,
        meetingId,
        (refund.amount || 0) / 100,
        `Your meeting was declined. A full refund of $${(refund.amount || 0) / 100} has been processed via Stripe and will appear in your account within 5-10 business days.`
      )

      return {
        success: true,
        refund,
        refundAmount: (refund.amount || 0) / 100,
        message: `Full refund of $${(refund.amount || 0) / 100} processed via Stripe`
      }

    } catch (error: any) {
      console.error('❌ Doctor decline refund failed:', error.message)
      return {
        success: false,
        refundAmount: 0,
        message: `Refund failed: ${error.message}`
      }
    }
  }

  /**
   * 🕐 Process patient cancellation refund (time-based)
   * 
   * @param meetingId - Meeting ID
   * @returns Refund processing result
   */
  async processPatientCancelRefund(meetingId: number): Promise<{
    success: boolean
    refund?: Stripe.Refund
    refundAmount: number
    refundType: 'full' | 'partial' | 'none'
    message: string
  }> {
    try {
      console.log(`🔄 Processing patient cancel refund for meeting ${meetingId}`)

      // Get meeting with payment details
      const meeting = await Meeting.findByPk(meetingId, {
        include: [
          { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
        ]
      })

      if (!meeting) {
        throw new Error('Meeting not found')
      }

      if (!meeting.stripePaymentIntentId) {
        throw new Error('No Stripe payment intent found for this meeting')
      }

      if (meeting.paymentStatus === 'refunded') {
        return {
          success: false,
          refundAmount: meeting.refundAmount || 0,
          refundType: 'none',
          message: 'Meeting already refunded'
        }
      }

      // Calculate time until meeting
      const now = new Date()
      const meetingDateTime = new Date(`${meeting.meetingDate} ${meeting.startTime}`)
      const hoursUntilMeeting = (meetingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

      let refundType: 'full' | 'partial' | 'none'
      let refundAmount: number

      if (hoursUntilMeeting > 24) {
        // Full refund for cancellations >24 hours
        refundType = 'full'
        refundAmount = meeting.consultationFee
      } else if (hoursUntilMeeting > 0) {
        // Partial refund for cancellations <24 hours
        refundType = 'partial'
        refundAmount = meeting.consultationFee * 0.5 // 50% refund
      } else {
        // No refund for past meetings
        refundType = 'none'
        refundAmount = 0
      }

      if (refundAmount === 0) {
        return {
          success: false,
          refundAmount: 0,
          refundType: 'none',
          message: 'No refund available for past meetings'
        }
      }

      // Create refund via Stripe API
      const refund = await this.createRefund(
        meeting.stripePaymentIntentId,
        refundAmount,
        'requested_by_customer',
        meetingId
      )

      // Update meeting with refund details
      await meeting.update({
        status: 'cancelled',
        paymentStatus: 'refunded',
        refundAmount,
        refundDate: new Date(),
        refundReason: `Patient cancelled ${hoursUntilMeeting.toFixed(1)} hours before meeting`,
        refundType,
        refundProcessed: true,
        stripeRefundId: refund.id
      })

      // Send notification to patient
      const notificationService = new NotificationService()
      await notificationService.createRefundNotification(
        meeting.patientId,
        0,
        meetingId,
        refundAmount,
        `Your meeting was cancelled. A ${refundType} refund of $${refundAmount} has been processed via Stripe and will appear in your account within 5-10 business days.`
      )

      return {
        success: true,
        refund,
        refundAmount,
        refundType,
        message: `${refundType === 'full' ? 'Full' : 'Partial'} refund of $${refundAmount} processed via Stripe`
      }

    } catch (error: any) {
      console.error('❌ Patient cancel refund failed:', error.message)
      return {
        success: false,
        refundAmount: 0,
        refundType: 'none',
        message: `Refund failed: ${error.message}`
      }
    }
  }
}

export default StripeRefundService
