// 📁 backend/src/services/PaymentService.ts
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

      // Create Stripe payment intent
      const paymentIntent = await stripeService.createPaymentIntent(amount, 'usd', {
        meetingId: meetingId.toString(),
        patientId: patientId.toString(),
        doctorId: doctorId.toString(),
        meetingDate: meeting.meetingDate,
        startTime: meeting.startTime,
      })

      // Create payment record
      const payment = await Payment.create({
        meetingId,
        patientId,
        doctorId,
        amount,
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

        // Update meeting
        const meeting = (payment as any).Meeting
        await meeting.update({
          isPaid: true,
          paymentStatus: 'paid',
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
   * Process refund when doctor declines meeting
   */
  async processRefundForDeclinedMeeting(meetingId: number, declineReason: string) {
    try {
      // Get meeting with payment details
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
        // No payment to refund
        return { success: true, message: 'No payment to refund' }
      }

      if (!payment.stripePaymentIntentId) {
        throw new Error('No Stripe payment intent found')
      }

      // Create refund in Stripe
      const refund = await stripeService.createRefund(
        payment.stripePaymentIntentId,
        'requested_by_customer',
        {
          meetingId: meetingId.toString(),
          reason: 'Doctor declined meeting',
          declineReason: declineReason,
        }
      )

      // Update payment record
      await payment.update({
        status: 'refunded',
        refundDate: new Date(),
        refundAmount: payment.amount,
        refundReason: `Doctor declined: ${declineReason}`,
        stripeRefundId: refund.id,
      })

      // Update meeting
      await meeting.update({
        paymentStatus: 'refunded',
        status: 'declined',
        declinedAt: new Date(),
        declineReason,
      })

      // Send refund notification to patient
      await this.notificationService.createRefundNotification(
        payment.patientId,
        payment.id,
        meetingId,
        payment.amount,
        `Your meeting was declined by the doctor. Reason: ${declineReason}`
      )

      return { success: true, refund, payment, meeting }
    } catch (error) {
      console.error('Error processing refund for declined meeting:', error)
      throw new Error('Failed to process refund')
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
