// 📁 backend/src/services/NotificationService.ts
import Notification from '../models/Notification'
import { User } from '../models/User'

export class NotificationService {
  /**
   * Create a payment confirmation notification
   */
  async createPaymentConfirmationNotification(
    userId: number,
    paymentId: number,
    meetingId: number,
    amount: number
  ) {
    try {
      await Notification.create({
        userId,
        title: 'Payment Confirmed',
        message: `Your payment of $${amount.toFixed(2)} has been successfully processed. Your meeting booking is confirmed.`,
        type: 'payment',
        paymentId,
        meetingId,
        actionUrl: `/patient/meetings/${meetingId}`,
        actionText: 'View Meeting',
        data: JSON.stringify({
          amount,
          status: 'paid',
          meetingId,
        }),
      })
    } catch (error) {
      console.error('Error creating payment confirmation notification:', error)
    }
  }

  /**
   * Create a refund notification
   */
  async createRefundNotification(
    userId: number,
    paymentId: number,
    meetingId: number,
    refundAmount: number,
    message: string
  ) {
    try {
      await Notification.create({
        userId,
        title: 'Refund Processed',
        message,
        type: 'refund',
        paymentId,
        meetingId,
        actionUrl: `/patient/payments/${paymentId}`,
        actionText: 'View Payment Details',
        data: JSON.stringify({
          refundAmount,
          originalAmount: refundAmount,
          meetingId,
          status: 'refunded',
        }),
      })
    } catch (error) {
      console.error('Error creating refund notification:', error)
    }
  }

  /**
   * Create a booking notification for doctor
   */
  async createBookingNotificationForDoctor(
    doctorId: number,
    meetingId: number,
    patientId: number
  ) {
    try {
      const patient = await User.findByPk(patientId, {
        attributes: ['name'],
      })

      await Notification.create({
        userId: doctorId,
        title: 'New Meeting Request',
        message: `You have a new paid meeting request from ${patient?.name || 'a patient'}. Please review and approve.`,
        type: 'booking',
        meetingId,
        actionUrl: `/doctor/meetings/${meetingId}`,
        actionText: 'Review Request',
        data: JSON.stringify({
          patientId,
          meetingId,
          status: 'pending',
          isPaid: true,
        }),
      })
    } catch (error) {
      console.error('Error creating booking notification for doctor:', error)
    }
  }

  /**
   * Create a meeting approval notification
   */
  async createMeetingApprovalNotification(
    patientId: number,
    meetingId: number,
    doctorId: number,
    meetingUrl: string
  ) {
    try {
      const doctor = await User.findByPk(doctorId, {
        attributes: ['name'],
      })

      await Notification.create({
        userId: patientId,
        title: 'Meeting Approved',
        message: `Your meeting with Dr. ${doctor?.name || 'Unknown'} has been approved. You can join the meeting using the link provided.`,
        type: 'meeting',
        meetingId,
        actionUrl: meetingUrl,
        actionText: 'Join Meeting',
        data: JSON.stringify({
          doctorId,
          meetingId,
          status: 'approved',
          meetingUrl,
        }),
      })
    } catch (error) {
      console.error('Error creating meeting approval notification:', error)
    }
  }

  /**
   * Create a meeting decline notification
   */
  async createMeetingDeclineNotification(
    patientId: number,
    meetingId: number,
    doctorId: number,
    declineReason: string
  ) {
    try {
      const doctor = await User.findByPk(doctorId, {
        attributes: ['name'],
      })

      await Notification.create({
        userId: patientId,
        title: 'Meeting Declined',
        message: `Your meeting with Dr. ${doctor?.name || 'Unknown'} has been declined. Reason: ${declineReason}`,
        type: 'meeting',
        meetingId,
        actionUrl: `/patient/meetings`,
        actionText: 'Book Another Meeting',
        data: JSON.stringify({
          doctorId,
          meetingId,
          status: 'declined',
          declineReason,
        }),
      })
    } catch (error) {
      console.error('Error creating meeting decline notification:', error)
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: number, limit: number = 20) {
    try {
      const notifications = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
      })

      return notifications
    } catch (error) {
      console.error('Error getting user notifications:', error)
      return []
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: number, userId: number) {
    try {
      await Notification.update(
        { status: 'read' },
        { 
          where: { 
            id: notificationId, 
            userId 
          } 
        }
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: number) {
    try {
      await Notification.update(
        { status: 'read' },
        { 
          where: { 
            userId,
            status: 'unread'
          } 
        }
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount(userId: number): Promise<number> {
    try {
      const count = await Notification.count({
        where: {
          userId,
          status: 'unread',
        },
      })

      return count
    } catch (error) {
      console.error('Error getting unread notification count:', error)
      return 0
    }
  }
}
