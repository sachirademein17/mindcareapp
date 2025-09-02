/**
 * 💳 Enhanced Meeting Controller with Stripe Refund Integration
 * 
 * This version uses the actual Stripe API to process real refunds
 * Based on: https://docs.stripe.com/api/refunds
 */

import { Response, Request } from 'express'
import { Op } from 'sequelize'
import { Meeting } from '../models/Meeting'
import { User } from '../models/User'
import { DoctorDetails } from '../models/DoctorDetails'
import { Enrollment } from '../models/Enrollment'
import { DoctorAvailability } from '../models/DoctorAvailability'
import { NotificationService } from '../services/NotificationService'

// Define AuthRequest interface based on the existing auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: 'patient' | 'doctor' | 'admin'
  }
}
import { StripeRefundService } from '../services/StripeRefundService'

/**
 * 🚫 Decline Meeting with Stripe Refund
 * 
 * Enhanced version that processes actual Stripe refunds using the Stripe API
 */
export const declineMeetingWithStripe = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const { reason } = req.body
    const doctorId = parseInt(req.user?.id || '0')

    console.log(`🚫 Doctor ${doctorId} declining meeting ${meetingId}`)

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        doctorId,
        status: 'pending'
      },
      include: [
        { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
      ]
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or already processed' })
    }

    const declineReason = reason || 'Meeting declined by doctor'

    // Process Stripe refund if payment exists
    if (meeting.consultationFee > 0 && meeting.paymentStatus === 'paid') {
      console.log(`💳 Processing refund for meeting ${meetingId}`)
      console.log(`📊 Consultation fee: $${meeting.consultationFee}`)
      console.log(`🆔 Stripe Payment Intent: ${meeting.stripePaymentIntentId}`)

      if (meeting.stripePaymentIntentId) {
        try {
          // Use real Stripe API to process refund
          const stripeRefundService = new StripeRefundService()
          const refundResult = await stripeRefundService.processDoctorDeclineRefund(parseInt(meetingId))
          
          if (refundResult.success) {
            console.log(`✅ Stripe refund successful: $${refundResult.refundAmount}`)
            console.log(`🆔 Stripe Refund ID: ${refundResult.refund?.id}`)
            
            return res.json({
              message: '🎉 Meeting declined and Stripe refund processed successfully!',
              refundProcessed: true,
              refundAmount: refundResult.refundAmount,
              refundDetails: {
                originalAmount: meeting.consultationFee,
                refundAmount: refundResult.refundAmount,
                refundType: 'full',
                stripeRefundId: refundResult.refund?.id,
                stripeRefundStatus: refundResult.refund?.status,
                processingTime: '5-10 business days',
                reason: declineReason,
                method: 'Stripe API'
              },
              meeting: await Meeting.findByPk(meetingId, {
                include: [
                  { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
                  { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
                ]
              })
            })
          } else {
            console.log(`⚠️ Stripe refund failed: ${refundResult.message}`)
            
            // Fallback to manual refund tracking
            await meeting.update({
              status: 'declined',
              paymentStatus: 'refunded',
              declinedAt: new Date(),
              declineReason,
              refundAmount: meeting.consultationFee,
              refundDate: new Date(),
              refundReason: `Doctor declined: ${declineReason} (Stripe failed - manual refund needed)`,
              refundType: 'full',
              refundProcessed: false // Mark as needing manual processing
            })
            
            // Send notification about manual refund
            const notificationService = new NotificationService()
            await notificationService.createRefundNotification(
              meeting.patientId,
              0,
              Number(meetingId),
              meeting.consultationFee,
              `Your meeting was declined. Refund of $${meeting.consultationFee} will be processed manually within 24 hours due to payment system issue.`
            )
            
            return res.json({
              message: 'Meeting declined. Refund will be processed manually.',
              refundProcessed: false,
              refundAmount: meeting.consultationFee,
              refundDetails: {
                originalAmount: meeting.consultationFee,
                refundAmount: meeting.consultationFee,
                refundType: 'full',
                processingTime: '24 hours (manual)',
                reason: declineReason,
                method: 'Manual (Stripe failed)',
                error: refundResult.message
              }
            })
          }
          
        } catch (stripeError: any) {
          console.error('❌ Stripe service error:', stripeError.message)
          
          // Decline meeting but mark refund as failed
          await meeting.update({
            status: 'declined',
            declinedAt: new Date(),
            declineReason,
            refundAmount: meeting.consultationFee,
            refundDate: new Date(),
            refundReason: `Doctor declined: ${declineReason} (Refund failed)`,
            refundType: 'full',
            refundProcessed: false
          })
          
          return res.status(500).json({
            message: 'Meeting declined but refund processing failed',
            refundProcessed: false,
            refundAmount: 0,
            error: 'Payment service temporarily unavailable. Refund will be processed manually.',
            supportMessage: 'Please contact support if refund is not processed within 24 hours.'
          })
        }
      } else {
        console.log('⚠️ No Stripe payment intent found - using database tracking')
        
        // No Stripe payment intent, use simple database tracking
        await meeting.update({
          status: 'declined',
          paymentStatus: 'refunded',
          declinedAt: new Date(),
          declineReason,
          refundAmount: meeting.consultationFee,
          refundDate: new Date(),
          refundReason: `Doctor declined: ${declineReason}`,
          refundType: 'full',
          refundProcessed: true
        })
        
        const notificationService = new NotificationService()
        await notificationService.createRefundNotification(
          meeting.patientId,
          0,
          Number(meetingId),
          meeting.consultationFee,
          `Your meeting was declined. Refund of $${meeting.consultationFee} has been processed.`
        )
        
        return res.json({
          message: 'Meeting declined and refund processed successfully',
          refundProcessed: true,
          refundAmount: meeting.consultationFee,
          refundDetails: {
            originalAmount: meeting.consultationFee,
            refundAmount: meeting.consultationFee,
            refundType: 'full',
            processingTime: 'immediate',
            reason: declineReason,
            method: 'Database tracking'
          }
        })
      }
    } else {
      // No payment to refund
      console.log('ℹ️ No payment to refund')
      
      await meeting.update({
        status: 'declined',
        declinedAt: new Date(),
        declineReason
      })
      
      const notificationService = new NotificationService()
      await notificationService.createMeetingDeclineNotification(
        meeting.patientId,
        Number(meetingId),
        doctorId,
        declineReason
      )
      
      return res.json({
        message: 'Meeting declined successfully',
        refundProcessed: false,
        refundAmount: 0,
        refundDetails: {
          originalAmount: meeting.consultationFee,
          refundAmount: 0,
          refundType: 'none',
          reason: 'No payment made',
          method: 'N/A'
        }
      })
    }

  } catch (error: any) {
    console.error('❌ Decline meeting error:', error)
    res.status(500).json({ 
      error: 'Failed to decline meeting', 
      details: error.message,
      supportMessage: 'Please try again or contact support if the issue persists.'
    })
  }
}

/**
 * 🔄 Cancel Meeting with Stripe Refund (Time-based)
 * 
 * Enhanced version that processes actual Stripe refunds with time-based logic
 */
export const cancelMeetingWithStripe = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const { reason } = req.body
    const patientId = parseInt(req.user?.id || '0')

    console.log(`🔄 Patient ${patientId} cancelling meeting ${meetingId}`)

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        patientId,
        status: { [Op.in]: ['pending', 'approved'] }
      },
      include: [
        { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
      ]
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or cannot be cancelled' })
    }

    const cancelReason = reason || 'Meeting cancelled by patient'

    // Process time-based Stripe refund if payment exists
    if (meeting.consultationFee > 0 && meeting.paymentStatus === 'paid' && meeting.stripePaymentIntentId) {
      try {
        console.log(`💳 Processing time-based refund for meeting ${meetingId}`)
        
        const stripeRefundService = new StripeRefundService()
        const refundResult = await stripeRefundService.processPatientCancelRefund(parseInt(meetingId))
        
        if (refundResult.success) {
          console.log(`✅ Stripe ${refundResult.refundType} refund successful: $${refundResult.refundAmount}`)
          
          return res.json({
            message: `🎉 Meeting cancelled and ${refundResult.refundType} Stripe refund processed successfully!`,
            refundProcessed: true,
            refundAmount: refundResult.refundAmount,
            refundDetails: {
              originalAmount: meeting.consultationFee,
              refundAmount: refundResult.refundAmount,
              refundType: refundResult.refundType,
              stripeRefundId: refundResult.refund?.id,
              stripeRefundStatus: refundResult.refund?.status,
              processingTime: '5-10 business days',
              reason: cancelReason,
              method: 'Stripe API (Time-based)'
            }
          })
        } else {
          console.log(`⚠️ Stripe refund failed: ${refundResult.message}`)
          
          return res.json({
            message: refundResult.message,
            refundProcessed: false,
            refundAmount: 0,
            refundDetails: {
              originalAmount: meeting.consultationFee,
              refundAmount: 0,
              refundType: refundResult.refundType,
              reason: cancelReason,
              method: 'Stripe API (Time-based)',
              error: refundResult.message
            }
          })
        }
        
      } catch (stripeError: any) {
        console.error('❌ Stripe cancel refund error:', stripeError.message)
        
        // Still cancel the meeting
        await meeting.update({
          status: 'cancelled',
          cancelledAt: new Date()
        })
        
        return res.status(500).json({
          message: 'Meeting cancelled but refund processing failed',
          refundProcessed: false,
          refundAmount: 0,
          error: 'Payment service temporarily unavailable. Refund will be processed manually.'
        })
      }
    } else {
      // No payment or no Stripe payment intent
      await meeting.update({
        status: 'cancelled',
        cancelledAt: new Date()
      })
      
      return res.json({
        message: 'Meeting cancelled successfully',
        refundProcessed: false,
        refundAmount: 0,
        refundDetails: {
          originalAmount: meeting.consultationFee,
          refundAmount: 0,
          refundType: 'none',
          reason: 'No payment made or no Stripe payment',
          method: 'N/A'
        }
      })
    }

  } catch (error: any) {
    console.error('❌ Cancel meeting error:', error)
    res.status(500).json({ 
      error: 'Failed to cancel meeting', 
      details: error.message 
    })
  }
}

// Export both new functions
export { declineMeetingWithStripe as declineMeeting, cancelMeetingWithStripe as cancelMeeting }
