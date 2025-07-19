"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 📁 backend/src/routes/chatRoutes.ts
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
// All chat routes require authentication
router.use(auth_middleware_1.verifyToken);
// Send a message
router.post('/send/:userId', chatController_1.sendMessage);
// Get messages between current user and specified user
router.get('/messages/:userId', chatController_1.getMessages);
// Get chat list (users with whom current user has chatted)
router.get('/list', chatController_1.getChatList);
// Mark messages as read
router.put('/read/:userId', chatController_1.markAsRead);
exports.default = router;
