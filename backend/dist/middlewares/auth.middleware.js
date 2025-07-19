"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.requireRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret';
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'No token provided' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(403).json({ error: 'Invalid token' });
    }
};
exports.verifyToken = verifyToken;
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
