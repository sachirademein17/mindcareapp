// 📁 backend/src/controllers/simple-refund.controller.ts
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { Meeting, User, DoctorDetails } from '../models'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    [key: string]: any
  }
}

/**
 * Get refund history for a patient
 */
export const getPatientRefundHistory = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = parseInt(req.user?.id || '0')

    if (!patientId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const refundedMeetings = await Meeting.findAll({
      where: {
        patientId,
        refundProcessed: true,
        refundAmount: { [Op.gt]: 0 }
      },
      include: [
        {
          model: User,
          as: 'Doctor',
          attributes: ['id', 'name'],
          include: [{ model: DoctorDetails, as: 'DoctorDetail', attributes: ['specialization'] }]
        }
      ],
      order: [['refundDate', 'DESC']]
    })

    const totalRefundAmount = refundedMeetings.reduce((sum, meeting) => 
      sum + (meeting.refundAmount || 0), 0
    )

    res.json({
      success: true,
      totalRefunds: refundedMeetings.length,
      totalRefundAmount,
      refunds: refundedMeetings.map(meeting => {
        const meetingData = meeting as any
        return {
          meetingId: meeting.id,
          doctorName: meetingData.Doctor?.name,
          doctorSpecialization: meetingData.Doctor?.DoctorDetail?.specialization,
          originalAmount: meeting.consultationFee,
          refundAmount: meeting.refundAmount,
          refundType: meeting.refundType,
          refundDate: meeting.refundDate,
          refundReason: meeting.refundReason,
          meetingDate: meeting.meetingDate,
          startTime: meeting.startTime,
          status: meeting.status
        }
      })
    })
  } catch (error) {
    console.error('Error getting patient refund history:', error)
    res.status(500).json({ error: 'Failed to get refund history' })
  }
}

/**
 * Get refund statistics for doctor
 */
export const getDoctorRefundStats = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = parseInt(req.user?.id || '0')

    if (!doctorId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const refundedMeetings = await Meeting.findAll({
      where: {
        doctorId,
        refundProcessed: true,
        refundAmount: { [Op.gt]: 0 }
      },
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['id', 'name']
        }
      ],
      order: [['refundDate', 'DESC']]
    })

    const totalRefundAmount = refundedMeetings.reduce((sum, meeting) => 
      sum + (meeting.refundAmount || 0), 0
    )

    const declinedRefunds = refundedMeetings.filter(m => m.status === 'declined')
    const cancelledRefunds = refundedMeetings.filter(m => m.status === 'cancelled')

    res.json({
      success: true,
      statistics: {
        totalRefunds: refundedMeetings.length,
        totalRefundAmount,
        declinedMeetings: declinedRefunds.length,
        cancelledMeetings: cancelledRefunds.length,
        averageRefundAmount: refundedMeetings.length > 0 ? 
          totalRefundAmount / refundedMeetings.length : 0
      },
      recentRefunds: refundedMeetings.slice(0, 10).map(meeting => {
        const meetingData = meeting as any
        return {
          meetingId: meeting.id,
          patientName: meetingData.Patient?.name,
          refundAmount: meeting.refundAmount,
          refundType: meeting.refundType,
          refundDate: meeting.refundDate,
          refundReason: meeting.refundReason,
          meetingDate: meeting.meetingDate,
          status: meeting.status
        }
      })
    })
  } catch (error) {
    console.error('Error getting doctor refund stats:', error)
    res.status(500).json({ error: 'Failed to get refund statistics' })
  }
}

/**
 * Check if a meeting is eligible for refund
 */
export const checkRefundEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const userId = parseInt(req.user?.id || '0')

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        [Op.or]: [{ patientId: userId }, { doctorId: userId }]
      }
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    // Check if already refunded
    if (meeting.refundProcessed) {
      return res.json({
        eligible: false,
        reason: 'Meeting already refunded',
        refundAmount: meeting.refundAmount,
        refundDate: meeting.refundDate
      })
    }

    // Check if paid
    if (meeting.paymentStatus !== 'paid') {
      return res.json({
        eligible: false,
        reason: 'Meeting not paid for',
        paymentStatus: meeting.paymentStatus
      })
    }

    // Calculate potential refund based on timing
    const meetingDateTime = new Date(`${meeting.meetingDate}T${meeting.startTime}:00`)
    const now = new Date()
    const hoursUntilMeeting = (meetingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundType: 'full' | 'partial' | 'none' = 'none'
    let refundAmount = 0

    if (meeting.status === 'pending' || meeting.status === 'approved') {
      if (hoursUntilMeeting >= 24) {
        refundType = 'full'
        refundAmount = meeting.consultationFee
      } else if (hoursUntilMeeting > 0) {
        refundType = 'partial'
        refundAmount = meeting.consultationFee * 0.5
      }
    }

    res.json({
      eligible: refundAmount > 0,
      refundType,
      refundAmount,
      originalAmount: meeting.consultationFee,
      hoursUntilMeeting: hoursUntilMeeting.toFixed(2),
      meetingStatus: meeting.status,
      paymentStatus: meeting.paymentStatus
    })
  } catch (error) {
    console.error('Error checking refund eligibility:', error)
    res.status(500).json({ error: 'Failed to check refund eligibility' })
  }
}

/**
 * Get platform-wide refund statistics (admin only)
 */
export const getPlatformRefundStats = async (req: AuthRequest, res: Response) => {
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
    }

    const refundedMeetings = await Meeting.findAll({
      where: {
        refundProcessed: true,
        refundAmount: { [Op.gt]: 0 },
        ...dateFilter
      },
      include: [
        { model: User, as: 'Patient', attributes: ['name'] },
        { model: User, as: 'Doctor', attributes: ['name'] }
      ]
    })

    const totalRefundAmount = refundedMeetings.reduce((sum, m) => sum + (m.refundAmount || 0), 0)
    const averageRefundAmount = refundedMeetings.length > 0 ? totalRefundAmount / refundedMeetings.length : 0

    const refundsByType = {
      full: refundedMeetings.filter(m => m.refundType === 'full').length,
      partial: refundedMeetings.filter(m => m.refundType === 'partial').length
    }

    const refundsByStatus = {
      declined: refundedMeetings.filter(m => m.status === 'declined').length,
      cancelled: refundedMeetings.filter(m => m.status === 'cancelled').length
    }

    res.json({
      success: true,
      statistics: {
        totalRefunds: refundedMeetings.length,
        totalRefundAmount,
        averageRefundAmount,
        refundsByType,
        refundsByStatus
      },
      recentRefunds: refundedMeetings.slice(-20).map(meeting => {
        const meetingData = meeting as any
        return {
          meetingId: meeting.id,
          patientName: meetingData.Patient?.name,
          doctorName: meetingData.Doctor?.name,
          refundAmount: meeting.refundAmount,
          refundType: meeting.refundType,
          refundDate: meeting.refundDate,
          status: meeting.status
        }
      })
    })
  } catch (error) {
    console.error('Error getting platform refund stats:', error)
    res.status(500).json({ error: 'Failed to get platform statistics' })
  }
}
