// 📁 backend/src/controllers/payment.controller.ts
import { Request, Response } from 'express'
import { paymentService } from '../services/PaymentService'
import { stripeService } from '../services/StripeService'
import Meeting from '../models/Meeting'
import { User } from '../models/User'
import { DoctorDetails } from '../models/DoctorDetails'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: string
    email: string
  }
}

/**
 * Create payment intent for meeting booking
 */
export const createPaymentIntent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { meetingId } = req.body
    const patientId = parseInt(req.user?.id || '0')

    if (!patientId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (req.user?.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can make payments' })
    }

    // Get meeting details
    const meeting = await Meeting.findByPk(meetingId, {
      include: [
        { 
          model: User, 
          as: 'Doctor',
          include: [{ model: DoctorDetails, as: 'DoctorDetail' }]
        },
        { model: User, as: 'Patient' },
      ],
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    if (meeting.patientId !== patientId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (meeting.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Meeting is already paid' })
    }

    // Create payment
    const paymentResult = await paymentService.createMeetingPayment(
      meetingId,
      patientId,
      meeting.doctorId,
      meeting.consultationFee
    )

    res.json({
      success: true,
      payment: paymentResult.payment,
      clientSecret: paymentResult.clientSecret,
      paymentIntentId: paymentResult.paymentIntentId,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
}

/**
 * Confirm payment completion
 */
export const confirmPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId, paymentIntentId } = req.body
    const userId = parseInt(req.user?.id || '0')

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const result = await paymentService.confirmPayment(paymentId, paymentIntentId)

    if (result.success) {
      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        payment: result.payment,
        meeting: result.meeting,
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.reason,
      })
    }
  } catch (error) {
    console.error('Error confirming payment:', error)
    res.status(500).json({ error: 'Failed to confirm payment' })
  }
}

/**
 * Get payment details
 */
export const getPaymentDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params
    const userId = parseInt(req.user?.id || '0')

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const payment = await paymentService.getPaymentDetails(Number(paymentId))

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    // Check if user has access to this payment
    if (payment.patientId !== userId && payment.doctorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    res.json({
      success: true,
      payment,
    })
  } catch (error) {
    console.error('Error getting payment details:', error)
    res.status(500).json({ error: 'Failed to get payment details' })
  }
}

/**
 * Get user payments
 */
export const getUserPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.user?.id || '0')
    const role = req.user?.role

    if (!userId || !role) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (role !== 'patient' && role !== 'doctor') {
      return res.status(403).json({ error: 'Invalid role' })
    }

    const payments = await paymentService.getUserPayments(userId, role as 'patient' | 'doctor')

    res.json({
      success: true,
      payments,
    })
  } catch (error) {
    console.error('Error getting user payments:', error)
    res.status(500).json({ error: 'Failed to get user payments' })
  }
}

/**
 * Process refund (admin only)
 */
export const processRefund = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { meetingId, reason } = req.body
    const userId = parseInt(req.user?.id || '0')
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Only doctors can decline meetings (which triggers refunds)
    if (role !== 'doctor' && role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const result = await paymentService.processRefundForDeclinedMeeting(meetingId, reason)

    res.json({
      success: result.success,
      message: result.message || 'Refund processed successfully',
      refund: result.refund,
      payment: result.payment,
      meeting: result.meeting,
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    res.status(500).json({ error: 'Failed to process refund' })
  }
}

/**
 * Handle Stripe webhooks
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe signature' })
    }

    const event = stripeService.constructEvent(req.body, signature)

    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        const paymentIntent = event.data.object
        console.log('Payment succeeded:', paymentIntent.id)
        // Additional processing can be added here
        break

      case 'payment_intent.payment_failed':
        // Handle failed payment
        const failedPayment = event.data.object
        console.log('Payment failed:', failedPayment.id)
        // Additional processing can be added here
        break

      case 'charge.dispute.created':
        // Handle dispute created
        console.log('Dispute created:', event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Error handling Stripe webhook:', error)
    res.status(400).json({ error: 'Webhook handler failed' })
  }
}

/**
 * Get Stripe public key
 */
export const getStripePublicKey = async (req: Request, res: Response) => {
  try {
    res.json({
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    })
  } catch (error) {
    console.error('Error getting Stripe public key:', error)
    res.status(500).json({ error: 'Failed to get public key' })
  }
}
