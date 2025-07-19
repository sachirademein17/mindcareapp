import mongoose from 'mongoose'

const ChatMessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
})

export const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema)
