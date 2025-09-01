// 📁 backend/src/routes/notificationRoutes.ts
import express from 'express'
import { verifyToken } from '../middlewares/auth.middleware'
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
} from '../controllers/notification.controller'

const router = express.Router()

// All notification routes require authentication
router.use(verifyToken)

// Get user's notifications
router.get('/', getUserNotifications)

// Get unread notification count
router.get('/count/unread', getUnreadNotificationCount)

// Mark notification as read
router.put('/:notificationId/read', markNotificationAsRead)

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead)

// Delete notification
router.delete('/:notificationId', deleteNotification)

export default router
