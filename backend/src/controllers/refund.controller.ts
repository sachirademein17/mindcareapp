// 📁 backend/src/controllers/refund.controller.ts
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { paymentService } from '../services/PaymentService'
import { stripeService } from '../services/StripeService'
import Payment from '../models/Payment'
import Meeting from '../models/Meeting'
import { User } from '../models/User'
import { NotificationService } from '../services/NotificationService'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    [key: string]: any
  }
}

/**
 * Get refund history for a user
 */
export const getRefundHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user?.id || '0')
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const whereClause = role === 'patient' ? { patientId: userId } : { doctorId: userId }

    const refunds = await Payment.findAll({
      where: {
        ...whereClause,
        status: 'refunded'
      },
      include: [
        {
          model: Meeting,
          include: [
            { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
            { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
          ]
        }
      ],
      order: [['refundDate', 'DESC']]
    })

    res.json({
      success: true,
      refunds,
      total: refunds.length
    })
  } catch (error) {
    console.error('Error getting refund history:', error)
    res.status(500).json({ error: 'Failed to get refund history' })
  }
}

/**
 * Get refund details by ID
 */
export const getRefundDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { refundId } = req.params
    const userId = parseInt(req.user?.id || '0')
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const payment = await Payment.findOne({
      where: {
        id: refundId,
        status: 'refunded'
      },
      include: [
        {
          model: Meeting,
          include: [
            { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
            { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
          ]
        }
      ]
    })

    if (!payment) {
      return res.status(404).json({ error: 'Refund not found' })
    }

    // Check if user has access to this refund
    const hasAccess = role === 'admin' || 
                      payment.patientId === userId || 
                      payment.doctorId === userId

    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Get Stripe refund details if available
    let stripeRefundDetails = null
    if (payment.stripeRefundId) {
      try {
        stripeRefundDetails = await stripeService.getRefund(payment.stripeRefundId)
      } catch (stripeError) {
        console.error('Error getting Stripe refund details:', stripeError)
      }
    }

    res.json({
      success: true,
      refund: payment,
      stripeDetails: stripeRefundDetails
    })
  } catch (error) {
    console.error('Error getting refund details:', error)
    res.status(500).json({ error: 'Failed to get refund details' })
  }
}

/**
 * Process manual refund (admin only)
 */
export const processManualRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const { reason, amount, refundType } = req.body
    const userId = parseInt(req.user?.id || '0')
    const role = req.user?.role

    if (!userId || role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const meeting = await Meeting.findByPk(meetingId, {
      include: [
        {
          model: Payment,
          where: { status: { [Op.in]: ['completed', 'paid'] } },
          required: false
        },
        { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
      ]
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    const payment = (meeting as any).Payment
    if (!payment) {
      return res.status(404).json({ error: 'No payment found for this meeting' })
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({ error: 'Payment already refunded' })
    }

    // Determine refund amount
    let refundAmount = amount || payment.amount
    if (refundType === 'partial' && !amount) {
      refundAmount = payment.amount * 0.5 // 50% default for partial refund
    }

    if (refundAmount > payment.amount) {
      return res.status(400).json({ error: 'Refund amount cannot exceed original payment' })
    }

    // Process refund through Stripe
    const refund = await stripeService.createPartialRefund(
      payment.stripePaymentIntentId!,
      refundAmount,
      'requested_by_customer',
      {
        meetingId: meetingId.toString(),
        reason: reason || 'Manual refund by admin',
        adminId: userId.toString(),
        refundType: refundType || 'manual'
      }
    )

    // Update payment record
    await payment.update({
      status: 'refunded',
      refundDate: new Date(),
      refundAmount,
      refundReason: reason || 'Manual refund by admin',
      stripeRefundId: refund.id
    })

    // Update meeting status
    await meeting.update({
      paymentStatus: 'refunded',
      status: meeting.status === 'pending' ? 'cancelled' : meeting.status
    })

    // Send notification to patient
    const notificationService = new NotificationService()
    await notificationService.createRefundNotification(
      payment.patientId,
      payment.id,
      Number(meetingId),
      refundAmount,
      `A ${refundType || 'manual'} refund of $${refundAmount.toFixed(2)} has been processed for your meeting. Reason: ${reason || 'Manual refund by admin'}`
    )

    res.json({
      success: true,
      message: 'Manual refund processed successfully',
      refund: {
        id: refund.id,
        amount: refundAmount,
        originalAmount: payment.amount,
        refundType: refundType || 'manual',
        reason: reason || 'Manual refund by admin'
      },
      payment: await Payment.findByPk(payment.id)
    })
  } catch (error) {
    console.error('Error processing manual refund:', error)
    res.status(500).json({ error: 'Failed to process manual refund' })
  }
}

/**
 * Get refund statistics (admin only)
 */
export const getRefundStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { startDate, endDate } = req.query

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        refundDate: {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
        }
      }
    } else if (startDate) {
      dateFilter = {
        refundDate: {
          [Op.gte]: new Date(startDate as string)
        }
      }
    } else if (endDate) {
      dateFilter = {
        refundDate: {
          [Op.lte]: new Date(endDate as string)
        }
      }
    }

    // Get refund statistics
    const totalRefunds = await Payment.count({
      where: {
        status: 'refunded',
        ...dateFilter
      }
    })

    const totalRefundAmount = await Payment.sum('refundAmount', {
      where: {
        status: 'refunded',
        ...dateFilter
      }
    })

    const refundsByReason = await Payment.findAll({
      where: {
        status: 'refunded',
        ...dateFilter
      },
      attributes: [
        'refundReason',
        [Payment.sequelize!.fn('COUNT', Payment.sequelize!.col('id')), 'count'],
        [Payment.sequelize!.fn('SUM', Payment.sequelize!.col('refundAmount')), 'totalAmount']
      ],
      group: ['refundReason'],
      raw: true
    })

    const refundsByMonth = await Payment.findAll({
      where: {
        status: 'refunded',
        ...dateFilter
      },
      attributes: [
        [Payment.sequelize!.fn('DATE_TRUNC', 'month', Payment.sequelize!.col('refundDate')), 'month'],
        [Payment.sequelize!.fn('COUNT', Payment.sequelize!.col('id')), 'count'],
        [Payment.sequelize!.fn('SUM', Payment.sequelize!.col('refundAmount')), 'totalAmount']
      ],
      group: [Payment.sequelize!.fn('DATE_TRUNC', 'month', Payment.sequelize!.col('refundDate'))],
      order: [[Payment.sequelize!.fn('DATE_TRUNC', 'month', Payment.sequelize!.col('refundDate')), 'ASC']],
      raw: true
    })

    res.json({
      success: true,
      statistics: {
        totalRefunds,
        totalRefundAmount: totalRefundAmount || 0,
        refundsByReason,
        refundsByMonth
      }
    })
  } catch (error) {
    console.error('Error getting refund statistics:', error)
    res.status(500).json({ error: 'Failed to get refund statistics' })
  }
}

/**
 * Check refund eligibility
 */
export const checkRefundEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const userId = parseInt(req.user?.id || '0')

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        [Op.or]: [{ patientId: userId }, { doctorId: userId }]
      },
      include: [
        {
          model: Payment,
          where: { status: { [Op.in]: ['completed', 'paid'] } },
          required: false
        }
      ]
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    const payment = (meeting as any).Payment
    if (!payment) {
      return res.json({
        eligible: false,
        reason: 'No payment found for this meeting'
      })
    }

    if (payment.status === 'refunded') {
      return res.json({
        eligible: false,
        reason: 'Payment already refunded'
      })
    }

    // Check timing for cancellation refunds
    const meetingDateTime = new Date(`${meeting.meetingDate}T${meeting.startTime}:00`)
    const now = new Date()
    const hoursUntilMeeting = (meetingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundType = 'full'
    let refundAmount = payment.amount

    if (hoursUntilMeeting < 24 && hoursUntilMeeting > 0) {
      refundType = 'partial'
      refundAmount = payment.amount * 0.5
    } else if (hoursUntilMeeting <= 0) {
      refundType = 'none'
      refundAmount = 0
    }

    res.json({
      eligible: refundAmount > 0,
      refundType,
      refundAmount,
      originalAmount: payment.amount,
      hoursUntilMeeting: hoursUntilMeeting.toFixed(2),
      reason: refundAmount === 0 ? 'Meeting time has passed' : undefined
    })
  } catch (error) {
    console.error('Error checking refund eligibility:', error)
    res.status(500).json({ error: 'Failed to check refund eligibility' })
  }
}
