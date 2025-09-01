// 📁 backend/src/controllers/notification.controller.ts
import { Request, Response } from 'express'
import { Notification } from '../models'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: string
    email: string
  }
}

/**
 * Get all notifications for the authenticated user
 */
export const getUserNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.user?.id || '0')

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50, // Limit to 50 most recent notifications
    })

    res.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error('Error getting user notifications:', error)
    res.status(500).json({ error: 'Failed to get notifications' })
  }
}

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { notificationId } = req.params
    const userId = parseInt(req.user?.id || '0')

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const notification = await Notification.findOne({
      where: {
        id: Number(notificationId),
        userId,
      },
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    notification.status = 'read'
    await notification.save()

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification,
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
}

/**
 * Mark all notifications as read for the user
 */
export const markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.user?.id || '0')

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    await Notification.update(
      {
        status: 'read',
      },
      {
        where: {
          userId,
          status: 'unread',
        },
      }
    )

    res.json({
      success: true,
      message: 'All notifications marked as read',
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    res.status(500).json({ error: 'Failed to mark all notifications as read' })
  }
}

/**
 * Delete a notification
 */
export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { notificationId } = req.params
    const userId = parseInt(req.user?.id || '0')

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const notification = await Notification.findOne({
      where: {
        id: Number(notificationId),
        userId,
      },
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    await notification.destroy()

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ error: 'Failed to delete notification' })
  }
}

/**
 * Get unread notification count for the user
 */
export const getUnreadNotificationCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.user?.id || '0')

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const count = await Notification.count({
      where: {
        userId,
        status: 'unread',
      },
    })

    res.json({
      success: true,
      count,
    })
  } catch (error) {
    console.error('Error getting unread notification count:', error)
    res.status(500).json({ error: 'Failed to get unread notification count' })
  }
}
