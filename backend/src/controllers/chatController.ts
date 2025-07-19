// 📁 backend/src/controllers/chatController.ts
import { Request, Response } from 'express'
import { ChatMessagePG } from '../models/ChatMessagePG'
import { User } from '../models/User'
import { Op } from 'sequelize'

// Send a new message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, message } = req.body
    const senderId = (req as any).user.id

    console.log(`📤 sendMessage API called: from ${senderId} to ${receiverId}, message: "${message}"`)

    if (!receiverId || !message?.trim()) {
      return res.status(400).json({ error: 'Receiver ID and message are required' })
    }

    // Verify receiver exists
    const receiver = await User.findByPk(receiverId)
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' })
    }

    // Create message
    const chatMessage = await ChatMessagePG.create({
      senderId: parseInt(senderId),
      receiverId: parseInt(receiverId),
      message: message.trim(),
      timestamp: new Date(),
      isRead: false
    })

    console.log(`💾 Message saved to database with ID: ${chatMessage.id}`)

    // Fetch the message with sender and receiver info
    const messageWithUsers = await ChatMessagePG.findByPk(chatMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'role'] }
      ]
    })

    res.status(201).json({
      id: chatMessage.id,
      senderId: chatMessage.senderId,
      receiverId: chatMessage.receiverId,
      message: chatMessage.message,
      timestamp: chatMessage.timestamp,
      isRead: chatMessage.isRead,
      sender: messageWithUsers?.sender,
      receiver: messageWithUsers?.receiver
    })
  } catch (error) {
    console.error('❌ Error sending message:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

// Get messages between two users
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const currentUserId = (req as any).user.id

    console.log(`📝 getMessages API called: currentUser=${currentUserId}, withUser=${userId}`)

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Get all messages between current user and specified user
    const messages = await ChatMessagePG.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: parseInt(userId) },
          { senderId: parseInt(userId), receiverId: currentUserId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'role'] }
      ],
      order: [['timestamp', 'ASC']]
    })

    console.log(`📨 Found ${messages.length} messages between users ${currentUserId} and ${userId}`)

    // Mark messages as read (where current user is receiver)
    await ChatMessagePG.update(
      { isRead: true },
      {
        where: {
          senderId: parseInt(userId),
          receiverId: currentUserId,
          isRead: false
        }
      }
    )

    res.json(messages)
  } catch (error) {
    console.error('❌ Error fetching messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
}

// Get chat list (users with whom current user has exchanged messages)
export const getChatList = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.id

    // Get unique users who have chatted with current user
    const chatUsers = await ChatMessagePG.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'role'] }
      ],
      order: [['timestamp', 'DESC']]
    })

    // Extract unique users and their latest messages
    const userChats = new Map()
    
    chatUsers.forEach(msg => {
      const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender
      if (otherUser && !userChats.has(otherUser.id)) {
        userChats.set(otherUser.id, {
          user: otherUser,
          lastMessage: {
            message: msg.message,
            timestamp: msg.timestamp,
            isOwn: msg.senderId === currentUserId
          },
          unreadCount: 0
        })
      }
    })

    // Count unread messages for each chat
    for (const [userId, chatData] of userChats) {
      const unreadCount = await ChatMessagePG.count({
        where: {
          senderId: userId,
          receiverId: currentUserId,
          isRead: false
        }
      })
      chatData.unreadCount = unreadCount
    }

    res.json(Array.from(userChats.values()))
  } catch (error) {
    console.error('❌ Error fetching chat list:', error)
    res.status(500).json({ error: 'Failed to fetch chat list' })
  }
}

// Mark messages as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const currentUserId = (req as any).user.id

    await ChatMessagePG.update(
      { isRead: true },
      {
        where: {
          senderId: parseInt(userId),
          receiverId: currentUserId,
          isRead: false
        }
      }
    )

    res.json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error('❌ Error marking messages as read:', error)
    res.status(500).json({ error: 'Failed to mark messages as read' })
  }
}
