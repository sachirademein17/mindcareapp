// 📁 backend/src/routes/refundRoutes.ts
import { Router } from 'express'
import {
  getRefundHistory,
  getRefundDetails,
  processManualRefund,
  getRefundStatistics,
  checkRefundEligibility
} from '../controllers/refund.controller'
import { verifyToken, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// All routes require authentication
router.use(verifyToken)

// Get refund history for user (patient or doctor)
router.get('/history', getRefundHistory)

// Get specific refund details
router.get('/:refundId', getRefundDetails)

// Check refund eligibility for a meeting
router.get('/eligibility/:meetingId', checkRefundEligibility)

// Admin-only routes
router.get('/admin/statistics', requireRole('admin'), getRefundStatistics)
router.post('/admin/manual/:meetingId', requireRole('admin'), processManualRefund)

export default router
