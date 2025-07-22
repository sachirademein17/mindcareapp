"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 📁 backend/src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_1 = __importDefault(require("./routes/admin"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
// DB Config
const postgres_config_1 = __importDefault(require("./config/postgres.config"));
const index_1 = require("./models/index");
// Chat model
const ChatMessagePG_1 = require("./models/ChatMessagePG");
const meetingRoutes_1 = __importDefault(require("./routes/meetingRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Setup HTTP server for Socket.io
const server = http_1.default.createServer(app);
// 🌐 Setup CORS and Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 🔌 REST API Routes
app.use('/auth', auth_routes_1.default);
app.use('/admin', admin_1.default);
app.use('/doctor', doctorRoutes_1.default);
app.use('/patient', patientRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/meetings', meetingRoutes_1.default);
// 📦 Connect PostgreSQL and initialize Sequelize models
(0, postgres_config_1.default)();
(0, index_1.initializeAllModels)();
// 🟢 MongoDB connection (REQUIRED for chat)
mongoose_1.default.connect(process.env.MONGO_URI || '')
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.log('❌ MongoDB error:', err));
// 📡 Socket.io setup
const io = new socket_io_1.Server(server, {
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});
io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`${userId} joined their room`);
    });
    socket.on('sendMessage', async ({ senderId, receiverId, message, _id }) => {
        try {
            console.log('📨 Received socket message data:', { senderId, receiverId, message, _id });
            // Validate that senderId and receiverId are valid numbers
            const senderIdNum = parseInt(senderId);
            const receiverIdNum = parseInt(receiverId);
            if (isNaN(senderIdNum) || isNaN(receiverIdNum)) {
                console.error('❌ Invalid senderId or receiverId:', { senderId, receiverId, senderIdNum, receiverIdNum });
                return; // Skip this message if IDs are invalid
            }
            // Only save to database if it's a new message (not from API)
            let savedMsg;
            if (!_id) {
                savedMsg = await ChatMessagePG_1.ChatMessagePG.create({
                    senderId: senderIdNum,
                    receiverId: receiverIdNum,
                    message,
                    timestamp: new Date(),
                    isRead: false
                });
            }
            else {
                // Message already saved via API, just relay it
                savedMsg = { senderId: senderIdNum, receiverId: receiverIdNum, message, timestamp: new Date(), id: _id };
            }
            console.log(`💬 Socket message from ${senderIdNum} to ${receiverIdNum}: ${message}`);
            // Send to receiver room (this is the main real-time delivery)
            socket.to(receiverId).emit('receiveMessage', savedMsg);
            console.log(`📨 Message delivered to receiver: ${receiverId}`);
            // Don't send back to sender since they already have it locally
        }
        catch (error) {
            console.error('❌ Error handling socket message:', error);
            // Even if save fails, still deliver the message
            const fallbackMsg = { senderId, receiverId, message, timestamp: new Date() };
            socket.to(receiverId).emit('receiveMessage', fallbackMsg);
        }
    });
    // Handle typing indicators
    socket.on('typing', ({ userId, receiverId, typing }) => {
        console.log(`⌨️ ${userId} is ${typing ? 'typing' : 'stopped typing'} to ${receiverId}`);
        // Send typing status to the receiver only
        io.to(receiverId).emit('userTyping', { userId, typing });
    });
    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});
// ✅ Start the combined REST + WebSocket server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
