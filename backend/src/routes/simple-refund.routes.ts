// 📁 backend/src/routes/simple-refund.routes.ts
import { Router } from 'express'
import { 
  getPatientRefundHistory,
  getDoctorRefundStats,
  checkRefundEligibility,
  getPlatformRefundStats
} from '../controllers/simple-refund.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()

// Patient endpoints
router.get('/patient/history', verifyToken, getPatientRefundHistory)

// Doctor endpoints  
router.get('/doctor/stats', verifyToken, getDoctorRefundStats)

// Check refund eligibility for any user
router.get('/check/:meetingId', verifyToken, checkRefundEligibility)

// Admin endpoint
router.get('/platform/stats', verifyToken, getPlatformRefundStats)

export default router
