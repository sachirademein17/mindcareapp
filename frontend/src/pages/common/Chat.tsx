import { useEffect, useState, useRef } from 'react'
import socket from '../../utils/socket'
import { chatAPI } from '../../routes/chatRoutes'

interface ChatProps {
  receiverId: string
}

const Chat = ({ receiverId }: ChatProps) => {
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const senderId = localStorage.getItem('userId') || ''
  const token = localStorage.getItem('token') || ''
  const userRole = localStorage.getItem('role') || '' // Get user role (doctor/patient)

  // Debug logging to verify role is stored correctly
  useEffect(() => {
    console.log('🔍 Chat Debug Info:', {
      senderId,
      receiverId,
      userRole,
      tokenExists: !!token,
      localStorageContents: {
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role')
      }
    })

    // If no senderId, show warning and don't proceed
    if (!senderId) {
      console.error('❌ No senderId found in localStorage. User may not be logged in properly.')
      return
    }
  }, [senderId, receiverId, userRole, token])

  // If not authenticated, show login prompt
  if (!senderId || !token) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Authentication Required</h3>
          <p className="text-gray-500 mb-4">Please log in to access the chat feature</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Check initial connection status
    setIsConnected(socket.connected)
    
    // Join the chat room with current user ID
    socket.emit('join', senderId)
    console.log(`🔗 Joining room: ${senderId}`)
    
    // Listen for connection status
    socket.on('connect', () => {
      setIsConnected(true)
      console.log('✅ Connected to chat server')
      // Re-join room after reconnection
      socket.emit('join', senderId)
    })
    
    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('❌ Disconnected from chat server')
    })

    // fetch old messages using the new API
    const loadMessages = async () => {
      try {
        const data = await chatAPI.getMessages(receiverId, token)
        console.log(`📨 Loaded ${data.length} messages between ${senderId} and ${receiverId}`)
        console.log('📋 Message data structure:', data.length > 0 ? data[0] : 'No messages')
        setMessages(data)
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()

    // Listen for new messages
    const handleReceiveMessage = (newMsg: any) => {
      console.log('📩 Received message:', {
        from: newMsg.senderId,
        to: newMsg.receiverId,
        message: newMsg.message,
        currentUser: senderId,
        currentReceiver: receiverId
      })
      
      // Only add messages between current user and the selected receiver
      if (
        (newMsg.senderId === senderId && newMsg.receiverId === receiverId) ||
        (newMsg.senderId === receiverId && newMsg.receiverId === senderId)
      ) {
        setMessages((prev) => {
          // Check for duplicates more strictly
          const messageExists = prev.some(msg => 
            msg.senderId === newMsg.senderId && 
            msg.receiverId === newMsg.receiverId && 
            msg.message === newMsg.message &&
            Math.abs(new Date(msg.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 2000
          )
          
          if (!messageExists) {
            console.log('✅ Adding new message to chat')
            return [...prev, newMsg]
          } else {
            console.log('⚠️ Duplicate message ignored')
            return prev
          }
        })
      } else {
        console.log('🚫 Message not for this chat')
      }
    }

    // Listen for typing indicators
    socket.on('receiveMessage', handleReceiveMessage)
    socket.on('userTyping', ({ userId, typing }) => {
      if (userId === receiverId) {
        setIsTyping(typing)
      }
    })

    return () => {
      socket.off('receiveMessage', handleReceiveMessage)
      socket.off('userTyping')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [receiverId, token, senderId])

  // Typing indicator
  let typingTimer: number
  const handleTyping = () => {
    socket.emit('typing', { userId: senderId, receiverId, typing: true })
    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      socket.emit('typing', { userId: senderId, receiverId, typing: false })
    }, 1000)
  }

  const sendMessage = async () => {
    if (!message.trim()) return
    
    // Check if user is properly logged in
    if (!senderId) {
      console.error('❌ Cannot send message: No senderId (user not logged in)')
      alert('Please log in to send messages')
      return
    }
    
    const messageData = {
      senderId,
      receiverId,
      message: message.trim(),
      timestamp: new Date()
    }
    
    console.log('📤 Sending message:', messageData)
    
    // Create optimistic message with temporary ID
    const optimisticMessage = { ...messageData, _id: `temp_${Date.now()}` }
    
    try {
      // Optimistically add message to UI first for immediate feedback
      setMessages(prev => [...prev, optimisticMessage])
      setMessage('')
      
      // Send via API for persistence
      const savedMessage = await chatAPI.sendMessage(receiverId, messageData.message, token)
      console.log('💾 Message saved to API:', savedMessage)
      
      // Send via socket for real-time delivery to other user
      socket.emit('sendMessage', {
        ...messageData,
        _id: savedMessage._id || savedMessage.id
      })
      console.log('📡 Message sent via Socket.io')
      
      // Update the optimistic message with real data
      setMessages(prev => 
        prev.map(msg => 
          msg._id === optimisticMessage._id ? { ...savedMessage, ...messageData } : msg
        )
      )
      
      // Stop typing indicator
      socket.emit('typing', { userId: senderId, receiverId, typing: false })
    } catch (error) {
      console.error('❌ Error sending message:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id))
      // Still try to send via socket even if API fails
      socket.emit('sendMessage', messageData)
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    } else {
      handleTyping()
    }
  }

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isToday = (timestamp: string | Date) => {
    const messageDate = new Date(timestamp)
    const today = new Date()
    return messageDate.toDateString() === today.toDateString()
  }

  const formatDate = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    if (isToday(timestamp)) {
      return 'Today'
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Function to get the correct label for message sender
  const getMessageLabel = (msgSenderId: string | number) => {
    // Convert both to strings to ensure proper comparison
    const msgSenderIdStr = String(msgSenderId)
    const currentUserIdStr = String(senderId)
    
    console.log(`🏷️ Label debug: msgSender=${msgSenderIdStr}, currentUser=${currentUserIdStr}, userRole=${userRole}`)
    
    if (msgSenderIdStr === currentUserIdStr) {
      // This message is from the current user
      return '👤 You'
    } else {
      // This message is from the other person
      if (userRole === 'doctor') {
        return '🩺 Patient'
      } else {
        return '🩺 Doctor'
      }
    }
  }

  // Function to get the header legend based on user role
  const getHeaderLegend = () => {
    if (userRole === 'doctor') {
      return {
        you: '👤 Your messages',
        them: '🩺 Patient messages'
      }
    } else {
      return {
        you: '👤 Your messages', 
        them: '🩺 Doctor messages'
      }
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      
      {/* Chat Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-semibold">
              💬
            </span>
          </div>
          <div>
            <h3 className="font-semibold">Chat</h3>
            <div className="flex items-center text-sm">
              <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-300' : 'bg-yellow-300'}`}></span>
              <span className="text-green-100">
                {isConnected ? 'Online' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Message alignment guide */}
        <div className="text-right text-green-100 text-xs">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-end">
              <span className="mr-2">{getHeaderLegend().you}</span>
              <div className="w-4 h-4 bg-green-400 rounded"></div>
            </div>
            <div className="flex items-center justify-end">
              <span className="mr-2">{getHeaderLegend().them}</span>
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="text-green-100 text-xs">
          {isTyping && (
            <div className="flex items-center">
              <div className="flex space-x-1 mr-2">
                <div className="w-1 h-1 bg-green-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              typing...
            </div>
          )}
        </div>
      </div>

      {/* Chat Background Pattern */}
      <div className="flex-1 bg-gray-50 bg-opacity-30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}>
          </div>
        </div>

        {/* Messages Area */}
        <div className="relative z-10 h-full overflow-y-auto px-4 py-4 space-y-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">Start your conversation</p>
                <p className="text-sm">Messages are secured with end-to-end encryption</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => {
                const isOwn = msg.senderId === senderId
                const showDateDivider = i === 0 || 
                  new Date(messages[i-1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString()
                
                return (
                  <div key={i}>
                    {/* Date Divider */}
                    {showDateDivider && (
                      <div className="flex justify-center my-4">
                        <span className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full shadow">
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
                      {/* Avatar for received messages */}
                      {!isOwn && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {receiverId.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
                        isOwn 
                          ? 'bg-green-500 text-white rounded-br-md ml-12' 
                          : 'bg-white text-gray-800 rounded-bl-md shadow-md mr-12 border border-gray-200'
                      }`}>
                        {/* Clear sender label */}
                        <div className={`text-xs font-bold mb-2 ${
                          isOwn ? 'text-green-100' : 'text-blue-600'
                        }`}>
                          {getMessageLabel(msg.senderId)}
                        </div>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <div className={`flex items-center justify-end mt-2 space-x-1 ${
                          isOwn ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{formatTime(msg.timestamp)}</span>
                          {isOwn && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Message tail */}
                        <div className={`absolute bottom-2 ${
                          isOwn 
                            ? 'right-0 translate-x-1 text-green-500' 
                            : 'left-0 -translate-x-1 text-white'
                        }`}>
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                            <path d="M0 8s0-2 2-4 4-4 6-4v8H0z"/>
                          </svg>
                        </div>
                      </div>
                      
                      {/* Avatar for sent messages */}
                      {isOwn && (
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            You
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-100 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
            <button className="text-gray-500 hover:text-gray-700 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </button>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 outline-none text-sm placeholder-gray-500"
              placeholder="Type a message"
            />
            <button className="text-gray-500 hover:text-gray-700 ml-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button 
            onClick={sendMessage} 
            disabled={!message.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              message.trim() 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
