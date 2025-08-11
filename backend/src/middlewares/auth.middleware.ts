import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

// Define user interface
interface UserJWT {
  id: string
  email: string
  role: string
  [key: string]: any
}

// Extend the Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserJWT
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret'

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 Auth middleware called')
  const token = req.headers.authorization?.split(' ')[1]
  console.log('🔍 Token received:', token ? 'YES' : 'NO')
  
  if (!token) {
    console.log('❌ No token provided')
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserJWT
    console.log('🔍 Token decoded successfully:', decoded)
    req.user = decoded
    next()
  } catch (error) {
    console.log('❌ Token verification failed:', error)
    res.status(403).json({ error: 'Invalid token' })
  }
}

export const checkSuspension = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Skip suspension check for admin users
    if (req.user.role === 'admin') {
      return next()
    }

    // Check if user is suspended in database
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.isSuspended) {
      return res.status(403).json({ 
        error: 'Account suspended',
        message: `Your account has been suspended. Reason: ${user.suspendReason}`,
        suspendedAt: user.suspendedAt,
        suspendReason: user.suspendReason
      })
    }

    next()
  } catch (error) {
    console.error('Error checking user suspension:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) return res.status(403).json({ error: 'Access denied' })
    next()
  }
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  next()
}