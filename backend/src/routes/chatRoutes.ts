// 📁 backend/src/routes/chatRoutes.ts
import express from 'express'
import { verifyToken } from '../middlewares/auth.middleware'
import { sendMessage, getMessages, getChatList, markAsRead } from '../controllers/chatController'

const router = express.Router()

// All chat routes require authentication
router.use(verifyToken)

// Send a message
router.post('/send/:userId', sendMessage)

// Get messages between current user and specified user
router.get('/messages/:userId', getMessages)

// Get chat list (users with whom current user has chatted)
router.get('/list', getChatList)

// Mark messages as read
router.put('/read/:userId', markAsRead)

export default router
