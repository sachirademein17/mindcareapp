"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.requireRole = exports.checkSuspension = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret';
const verifyToken = (req, res, next) => {
    console.log('🔍 Auth middleware called');
    const token = req.headers.authorization?.split(' ')[1];
    console.log('🔍 Token received:', token ? 'YES' : 'NO');
    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log('🔍 Token decoded successfully:', decoded);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log('❌ Token verification failed:', error);
        res.status(403).json({ error: 'Invalid token' });
    }
};
exports.verifyToken = verifyToken;
const checkSuspension = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Skip suspension check for admin users
        if (req.user.role === 'admin') {
            return next();
        }
        // Check if user is suspended in database
        const user = await User_1.User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.isSuspended) {
            return res.status(403).json({
                error: 'Account suspended',
                message: `Your account has been suspended. Reason: ${user.suspendReason}`,
                suspendedAt: user.suspendedAt,
                suspendReason: user.suspendReason
            });
        }
        next();
    }
    catch (error) {
        console.error('Error checking user suspension:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.checkSuspension = checkSuspension;
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role)
            return res.status(403).json({ error: 'Access denied' });
        next();
    };
};
exports.requireRole = requireRole;
const isAuthenticated = (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized' });
    next();
};
exports.isAuthenticated = isAuthenticated;
