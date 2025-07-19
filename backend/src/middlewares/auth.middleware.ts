import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Define user interface
interface User {
  id: string
  email: string
  role: string
  [key: string]: any
}

// Extend the Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret'

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User
    req.user = decoded
    next()
  } catch {
    res.status(403).json({ error: 'Invalid token' })
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