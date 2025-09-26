// 📁 backend/src/services/PaymentService.ts
import { Op } from 'sequelize'
import { stripeService } from './StripeService'
import Payment from '../models/Payment'
import Meeting from '../models/Meeting'
import Notification from '../models/Notification'
import { User } from '../models/User'
import { NotificationService } from './NotificationService'

export class PaymentService {
  private notificationService: NotificationService

  constructor() {
    this.notificationService = new NotificationService()
  }

  /**
   * Create a payment for a meeting booking
   */
  async createMeetingPayment(
    meetingId: number,
    patientId: number,
    doctorId: number,
    amount: number
  ) {
    try {
      // Get meeting details
      const meeting = await Meeting.findByPk(meetingId, {
        include: [
          { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] },
        ],
      })

      if (!meeting) {
        throw new Error('Meeting not found')
      }

      // Calculate fees
      const platformFee = stripeService.calculatePlatformFee(amount)
      const doctorEarnings = stripeService.calculateDoctorEarnings(amount)

      // Create Stripe payment intent - ONLY for platform commission (15%)
      const paymentIntent = await stripeService.createPaymentIntent(platformFee, 'usd', {
        meetingId: meetingId.toString(),
        patientId: patientId.toString(),
        doctorId: doctorId.toString(),
        meetingDate: meeting.meetingDate,
        startTime: meeting.startTime,
        totalConsultationFee: amount.toString(),
        platformCommissionOnly: 'true',
      })

      // Create payment record
      const payment = await Payment.create({
        meetingId,
        patientId,
        doctorId,
        amount: platformFee, // Only platform commission is charged
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntent.id,
        processingFee: platformFee,
        doctorEarnings,
        metadata: JSON.stringify({
          meetingDate: meeting.meetingDate,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          fullConsultationFee: amount, // Store full fee for reference
          patientPaysOnly: platformFee, // What patient actually pays
        }),
      })

      // Update meeting payment status
      await meeting.update({
        paymentStatus: 'pending',
        paymentId: payment.id,
      })

      return {
        payment,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }
    } catch (error) {
      console.error('Error creating meeting payment:', error)
      throw new Error('Failed to create payment')
    }
  }

  /**
   * Confirm payment completion
   */
  async confirmPayment(paymentId: number, stripePaymentIntentId: string) {
    try {
      // Get payment record
      const payment = await Payment.findByPk(paymentId, {
        include: [
          { model: Meeting, include: [
            { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
            { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] },
          ]},
        ],
      })

      if (!payment) {
        throw new Error('Payment not found')
      }

      // Get payment intent from Stripe
      const paymentIntent = await stripeService.getPaymentIntent(stripePaymentIntentId)

      if (paymentIntent.status === 'succeeded') {
        // Update payment record
        await payment.update({
          status: 'completed',
          paymentDate: new Date(),
          stripeChargeId: paymentIntent.latest_charge as string,
        })

        // Update meeting - For escrow model, payment is held until doctor approval
        const meeting = (payment as any).Meeting
        await meeting.update({
          isPaid: false, // Not actually paid to doctor yet - money is in escrow
          paymentStatus: 'pending', // Payment is pending doctor approval for escrow transfer
        })

        // Send notifications
        await this.notificationService.createPaymentConfirmationNotification(
          payment.patientId,
          payment.id,
          meeting.id,
          payment.amount
        )

        await this.notificationService.createBookingNotificationForDoctor(
          payment.doctorId,
          meeting.id,
          payment.patientId
        )

        return { success: true, payment, meeting }
      } else {
        // Payment failed
        await payment.update({
          status: 'failed',
          failureReason: `Payment status: ${paymentIntent.status}`,
        })

        const meeting = (payment as any).Meeting
        await meeting.update({
          paymentStatus: 'failed',
        })

        return { success: false, reason: `Payment ${paymentIntent.status}` }
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      throw new Error('Failed to confirm payment')
    }
  }

  /**
   * Process refund when doctor declines meeting - Enhanced version
   */
  async processRefundForDeclinedMeeting(meetingId: number, declineReason: string) {
    try {
      console.log(`🔄 Starting refund process for declined meeting ${meetingId}`)
      
      // Get meeting with payment details - enhanced query to find any eligible payment
      const meeting = await Meeting.findByPk(meetingId, {
        include: [
          {
            model: Payment,
            // Look for payments that can be refunded
            where: { 
              status: { 
                [Op.in]: ['pending', 'completed', 'succeeded', 'paid'] 
              }
            },
            required: false,
          },
          { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] },
        ],
      })

      if (!meeting) {
        throw new Error('Meeting not found')
      }

      console.log(`📊 Meeting found:`, {
        id: meeting.id,
        paymentStatus: meeting.paymentStatus,
        consultationFee: meeting.consultationFee,
        isPaid: meeting.isPaid
      })

      // Also try to find payment by meetingId if association didn't work
      let payment = (meeting as any).Payment
      if (!payment) {
        console.log('🔍 Payment not found through association, trying direct lookup...')
        payment = await Payment.findOne({
          where: {
            meetingId,
            status: { [Op.in]: ['pending', 'completed', 'succeeded', 'paid'] }
          }
        })
      }

      if (!payment) {
        console.log(`ℹ️ No eligible payment found for meeting ${meetingId}`)
        
        // Still update meeting status to declined
        await meeting.update({
          status: 'declined',
          declinedAt: new Date(),
          declineReason,
          paymentStatus: 'unpaid' // Reset to unpaid since no payment to refund
        })
        
        return { 
          success: true, 
          message: 'Meeting declined - no payment to refund',
          noRefundNeeded: true
        }
      }

      console.log(`💳 Payment found:`, {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        stripePaymentIntentId: payment.stripePaymentIntentId
      })

      // Validate payment data before attempting refund
      if (!payment.stripePaymentIntentId) {
        console.error('❌ No Stripe payment intent ID found')
        throw new Error('Payment intent ID missing - cannot process refund')
      }

      // Verify payment intent exists and can be refunded
      let paymentIntent
      try {
        paymentIntent = await stripeService.getPaymentIntent(payment.stripePaymentIntentId)
        console.log(`🔍 Stripe payment intent status: ${paymentIntent.status}`)
        
        if (paymentIntent.status !== 'succeeded') {
          console.log(`⚠️ Payment intent status is '${paymentIntent.status}' - may not be refundable`)
          if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'canceled') {
            // Update meeting and payment status but no Stripe refund needed
            await Promise.all([
              meeting.update({
                status: 'declined',
                paymentStatus: 'failed',
                declinedAt: new Date(),
                declineReason,
                isPaid: false
              }),
              payment.update({
                status: 'failed',
                failureReason: `Payment not completed when meeting was declined (status: ${paymentIntent.status})`
              })
            ])
            
            return { 
              success: true, 
              message: 'Meeting declined - payment was not completed, no refund needed',
              paymentStatus: paymentIntent.status
            }
          }
        }
      } catch (stripeError: any) {
        console.error('❌ Error verifying payment intent:', stripeError)
        
        // If we can't verify with Stripe, update local records but don't fail
        await Promise.all([
          meeting.update({
            status: 'declined',
            paymentStatus: 'failed',
            declinedAt: new Date(),
            declineReason,
            isPaid: false
          }),
          payment.update({
            status: 'failed',
            failureReason: `Could not verify payment with Stripe: ${stripeError.message}`
          })
        ])
        
        return { 
          success: true, 
          message: 'Meeting declined - could not verify payment status with Stripe',
          stripeError: stripeError.message
        }
      }

      // Create refund in Stripe
      let refund
      try {
        console.log(`💰 Creating Stripe refund for amount: $${payment.amount}`)
        refund = await stripeService.createRefund(
          payment.stripePaymentIntentId,
          'requested_by_customer',
          {
            meetingId: meetingId.toString(),
            reason: 'Doctor declined meeting',
            declineReason: declineReason,
            originalAmount: payment.amount.toString(),
            refundType: 'full_doctor_decline'
          }
        )
        console.log(`✅ Stripe refund created successfully: ${refund.id}`)
      } catch (stripeError: any) {
        console.error('❌ Stripe refund failed:', stripeError)
        
        // Update records to show refund attempt failed
        await Promise.all([
          meeting.update({
            status: 'declined',
            paymentStatus: 'failed',
            declinedAt: new Date(),
            declineReason: `${declineReason} (Refund failed: ${stripeError.message})`,
            isPaid: false
          }),
          payment.update({
            status: 'failed',
            failureReason: `Stripe refund failed: ${stripeError.message}`,
            refundReason: declineReason
          })
        ])
        
        throw new Error(`Stripe refund failed: ${stripeError.message}`)
      }

      // Update payment record
      try {
        await payment.update({
          status: 'refunded',
          refundDate: new Date(),
          refundAmount: payment.amount,
          refundReason: `Doctor declined: ${declineReason}`,
          stripeRefundId: refund.id,
        })
        console.log('✅ Payment record updated to refunded status')
      } catch (dbError: any) {
        console.error('❌ Failed to update payment record:', dbError)
        throw new Error('Refund processed in Stripe but failed to update payment record')
      }

      // Update meeting status
      try {
        await meeting.update({
          paymentStatus: 'refunded',
          status: 'declined',
          declinedAt: new Date(),
          declineReason,
          isPaid: false,
        })
        console.log('✅ Meeting status updated to declined with refund')
      } catch (dbError: any) {
        console.error('❌ Failed to update meeting status:', dbError)
        throw new Error('Refund processed but failed to update meeting status')
      }

      // Send refund notification to patient
      try {
        await this.notificationService.createRefundNotification(
          payment.patientId,
          payment.id,
          meetingId,
          payment.amount,
          `Your meeting was declined by the doctor. Reason: ${declineReason}. A full refund of $${payment.amount} has been processed and will appear in your account within 5-10 business days.`
        )
        console.log('✅ Refund notification sent to patient')
      } catch (notificationError: any) {
        console.error('⚠️ Failed to send refund notification:', notificationError)
        // Don't fail the whole process for notification errors
      }

      return { 
        success: true, 
        refund, 
        payment: await Payment.findByPk(payment.id), 
        meeting: await Meeting.findByPk(meetingId),
        message: `Full refund of $${payment.amount} processed successfully`
      }
    } catch (error: any) {
      console.error('❌ Error processing refund for declined meeting:', error)
      
      // Log detailed error for debugging
      console.error('❌ Full error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        meetingId,
        declineReason
      })
      
      throw new Error(`Failed to process refund: ${error.message}`)
    }
  }

  /**
   * Process refund for cancelled meeting
   */
  async processRefundForCancelledMeeting(meetingId: number, cancelReason: string, cancelledBy: 'patient' | 'doctor') {
    try {
      const meeting = await Meeting.findByPk(meetingId, {
        include: [
          {
            model: Payment,
            where: { status: 'completed' },
            required: false,
          },
          { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] },
        ],
      })

      if (!meeting) {
        throw new Error('Meeting not found')
      }

      const payment = (meeting as any).Payment
      if (!payment) {
        return { success: true, message: 'No payment to refund' }
      }

      // Check if refund is allowed (within 24 hours)
      const meetingDateTime = new Date(`${meeting.meetingDate}T${meeting.startTime}:00`)
      const now = new Date()
      const hoursUntilMeeting = (meetingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

      let refundAmount = payment.amount
      let refundReason = cancelReason

      if (hoursUntilMeeting < 24) {
        // Less than 24 hours - partial refund (50%)
        refundAmount = payment.amount * 0.5
        refundReason = `${cancelReason} (Partial refund - cancelled within 24 hours)`
      }

      // Create refund in Stripe
      const refund = await stripeService.createPartialRefund(
        payment.stripePaymentIntentId!,
        refundAmount,
        'requested_by_customer',
        {
          meetingId: meetingId.toString(),
          reason: `Meeting cancelled by ${cancelledBy}`,
          originalAmount: payment.amount.toString(),
          refundAmount: refundAmount.toString(),
        }
      )

      // Update payment record
      await payment.update({
        status: 'refunded',
        refundDate: new Date(),
        refundAmount,
        refundReason,
        stripeRefundId: refund.id,
      })

      // Update meeting
      await meeting.update({
        paymentStatus: 'refunded',
        status: 'cancelled',
        cancelledAt: new Date(),
      })

      // Send refund notification
      const notificationMessage = hoursUntilMeeting < 24
        ? `Your meeting was cancelled. You received a partial refund of $${refundAmount.toFixed(2)} (50% due to late cancellation).`
        : `Your meeting was cancelled. You received a full refund of $${refundAmount.toFixed(2)}.`

      await this.notificationService.createRefundNotification(
        payment.patientId,
        payment.id,
        meetingId,
        refundAmount,
        notificationMessage
      )

      return { success: true, refund, payment, meeting, refundAmount }
    } catch (error) {
      console.error('Error processing refund for cancelled meeting:', error)
      throw new Error('Failed to process refund')
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: number) {
    try {
      const payment = await Payment.findByPk(paymentId, {
        include: [
          {
            model: Meeting,
            include: [
              { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
              { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] },
            ],
          },
        ],
      })

      return payment
    } catch (error) {
      console.error('Error getting payment details:', error)
      throw new Error('Failed to get payment details')
    }
  }

  /**
   * Get payments for a user
   */
  async getUserPayments(userId: number, role: 'patient' | 'doctor') {
    try {
      const whereClause = role === 'patient' ? { patientId: userId } : { doctorId: userId }

      const payments = await Payment.findAll({
        where: whereClause,
        include: [
          {
            model: Meeting,
            include: [
              { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
              { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      })

      return payments
    } catch (error) {
      console.error('Error getting user payments:', error)
      throw new Error('Failed to get user payments')
    }
  }
}

export const paymentService = new PaymentService()
