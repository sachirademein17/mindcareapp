// 📁 backend/src/app.ts
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import http from 'http'
import { Server } from 'socket.io'

// Routes
import authRoutes from './routes/auth.routes'
import adminRoutes from './routes/admin'
import doctorRoutes from './routes/doctorRoutes'
import patientRoutes from './routes/patientRoutes'
import chatRoutes from './routes/chatRoutes'

// DB Config
import connectPostgres from './config/postgres.config'
import { initializeAllModels } from './models/index'

// Chat model
import { ChatMessagePG } from './models/ChatMessagePG'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Setup HTTP server for Socket.io
const server = http.createServer(app)

// 🌐 Setup CORS and Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 🔌 REST API Routes
app.use('/auth', authRoutes)
app.use('/admin', adminRoutes)
app.use('/doctor', doctorRoutes)
app.use('/patient', patientRoutes)
app.use('/api/chat', chatRoutes)

// 📦 Connect PostgreSQL and initialize Sequelize models
connectPostgres()
initializeAllModels()

// 🟢 MongoDB connection (REQUIRED for chat)
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err: any) => console.log('❌ MongoDB error:', err))

// 📡 Socket.io setup
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
})

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id)

  socket.on('join', (userId) => {
    socket.join(userId)
    console.log(`${userId} joined their room`)
  })

  socket.on('sendMessage', async ({ senderId, receiverId, message, _id }) => {
    try {
      console.log('📨 Received socket message data:', { senderId, receiverId, message, _id })
      
      // Validate that senderId and receiverId are valid numbers
      const senderIdNum = parseInt(senderId)
      const receiverIdNum = parseInt(receiverId)
      
      if (isNaN(senderIdNum) || isNaN(receiverIdNum)) {
        console.error('❌ Invalid senderId or receiverId:', { senderId, receiverId, senderIdNum, receiverIdNum })
        return // Skip this message if IDs are invalid
      }
      
      // Only save to database if it's a new message (not from API)
      let savedMsg
      if (!_id) {
        savedMsg = await ChatMessagePG.create({
          senderId: senderIdNum,
          receiverId: receiverIdNum,
          message,
          timestamp: new Date(),
          isRead: false
        })
      } else {
        // Message already saved via API, just relay it
        savedMsg = { senderId: senderIdNum, receiverId: receiverIdNum, message, timestamp: new Date(), id: _id }
      }
      
      console.log(`💬 Socket message from ${senderIdNum} to ${receiverIdNum}: ${message}`)
      
      // Send to receiver room (this is the main real-time delivery)
      socket.to(receiverId).emit('receiveMessage', savedMsg)
      console.log(`📨 Message delivered to receiver: ${receiverId}`)
      
      // Don't send back to sender since they already have it locally
      
    } catch (error) {
      console.error('❌ Error handling socket message:', error)
      // Even if save fails, still deliver the message
      const fallbackMsg = { senderId, receiverId, message, timestamp: new Date() }
      socket.to(receiverId).emit('receiveMessage', fallbackMsg)
    }
  })

  // Handle typing indicators
  socket.on('typing', ({ userId, receiverId, typing }) => {
    console.log(`⌨️ ${userId} is ${typing ? 'typing' : 'stopped typing'} to ${receiverId}`)
    // Send typing status to the receiver only
    io.to(receiverId).emit('userTyping', { userId, typing })
  })

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
  })
})

// ✅ Start the combined REST + WebSocket server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
