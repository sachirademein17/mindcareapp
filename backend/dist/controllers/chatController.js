"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getChatList = exports.getMessages = exports.sendMessage = void 0;
const ChatMessagePG_1 = require("../models/ChatMessagePG");
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
// Send a new message
const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user.id;
        console.log(`📤 sendMessage API called: from ${senderId} to ${receiverId}, message: "${message}"`);
        if (!receiverId || !message?.trim()) {
            return res.status(400).json({ error: 'Receiver ID and message are required' });
        }
        // Verify receiver exists
        const receiver = await User_1.User.findByPk(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: 'Receiver not found' });
        }
        // Create message
        const chatMessage = await ChatMessagePG_1.ChatMessagePG.create({
            senderId: parseInt(senderId),
            receiverId: parseInt(receiverId),
            message: message.trim(),
            timestamp: new Date(),
            isRead: false
        });
        console.log(`💾 Message saved to database with ID: ${chatMessage.id}`);
        // Fetch the message with sender and receiver info
        const messageWithUsers = await ChatMessagePG_1.ChatMessagePG.findByPk(chatMessage.id, {
            include: [
                { model: User_1.User, as: 'sender', attributes: ['id', 'name', 'role'] },
                { model: User_1.User, as: 'receiver', attributes: ['id', 'name', 'role'] }
            ]
        });
        res.status(201).json({
            id: chatMessage.id,
            senderId: chatMessage.senderId,
            receiverId: chatMessage.receiverId,
            message: chatMessage.message,
            timestamp: chatMessage.timestamp,
            isRead: chatMessage.isRead,
            sender: messageWithUsers?.sender,
            receiver: messageWithUsers?.receiver
        });
    }
    catch (error) {
        console.error('❌ Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};
exports.sendMessage = sendMessage;
// Get messages between two users
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        console.log(`📝 getMessages API called: currentUser=${currentUserId}, withUser=${userId}`);
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        // Get all messages between current user and specified user
        const messages = await ChatMessagePG_1.ChatMessagePG.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { senderId: currentUserId, receiverId: parseInt(userId) },
                    { senderId: parseInt(userId), receiverId: currentUserId }
                ]
            },
            include: [
                { model: User_1.User, as: 'sender', attributes: ['id', 'name', 'role'] },
                { model: User_1.User, as: 'receiver', attributes: ['id', 'name', 'role'] }
            ],
            order: [['timestamp', 'ASC']]
        });
        console.log(`📨 Found ${messages.length} messages between users ${currentUserId} and ${userId}`);
        // Mark messages as read (where current user is receiver)
        await ChatMessagePG_1.ChatMessagePG.update({ isRead: true }, {
            where: {
                senderId: parseInt(userId),
                receiverId: currentUserId,
                isRead: false
            }
        });
        res.json(messages);
    }
    catch (error) {
        console.error('❌ Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
exports.getMessages = getMessages;
// Get chat list (users with whom current user has exchanged messages)
const getChatList = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        // Get unique users who have chatted with current user
        const chatUsers = await ChatMessagePG_1.ChatMessagePG.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { senderId: currentUserId },
                    { receiverId: currentUserId }
                ]
            },
            include: [
                { model: User_1.User, as: 'sender', attributes: ['id', 'name', 'role'] },
                { model: User_1.User, as: 'receiver', attributes: ['id', 'name', 'role'] }
            ],
            order: [['timestamp', 'DESC']]
        });
        // Extract unique users and their latest messages
        const userChats = new Map();
        chatUsers.forEach(msg => {
            const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender;
            if (otherUser && !userChats.has(otherUser.id)) {
                userChats.set(otherUser.id, {
                    user: otherUser,
                    lastMessage: {
                        message: msg.message,
                        timestamp: msg.timestamp,
                        isOwn: msg.senderId === currentUserId
                    },
                    unreadCount: 0
                });
            }
        });
        // Count unread messages for each chat
        for (const [userId, chatData] of userChats) {
            const unreadCount = await ChatMessagePG_1.ChatMessagePG.count({
                where: {
                    senderId: userId,
                    receiverId: currentUserId,
                    isRead: false
                }
            });
            chatData.unreadCount = unreadCount;
        }
        res.json(Array.from(userChats.values()));
    }
    catch (error) {
        console.error('❌ Error fetching chat list:', error);
        res.status(500).json({ error: 'Failed to fetch chat list' });
    }
};
exports.getChatList = getChatList;
// Mark messages as read
const markAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        await ChatMessagePG_1.ChatMessagePG.update({ isRead: true }, {
            where: {
                senderId: parseInt(userId),
                receiverId: currentUserId,
                isRead: false
            }
        });
        res.json({ message: 'Messages marked as read' });
    }
    catch (error) {
        console.error('❌ Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};
exports.markAsRead = markAsRead;
