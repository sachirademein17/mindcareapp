// 📁 backend/src/routes/warningRoutes.ts
import { Router } from 'express'
import { verifyToken, requireRole, checkSuspension } from '../middlewares/auth.middleware'
import {
  submitWarning,
  getMyWarnings,
  getAllWarnings,
  updateWarningStatus,
  getWarningStats
} from '../controllers/warningController'

const router = Router()

// Middleware for authenticated users (patients and doctors) with suspension check
const requireAuth = [verifyToken, checkSuspension]

// Middleware for admin only
const requireAdmin = [verifyToken, requireRole('admin')]

// Submit a warning (patients and doctors can report each other)
router.post('/submit', requireAuth, submitWarning)

// Get my submitted warnings
router.get('/my-warnings', requireAuth, getMyWarnings)

// Admin routes
router.get('/all', requireAdmin, getAllWarnings)
router.put('/:warningId/status', requireAdmin, updateWarningStatus)
router.get('/stats', requireAdmin, getWarningStats)

export default router
