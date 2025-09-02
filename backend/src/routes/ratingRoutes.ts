// 🌟 Rating Routes
import { Router } from 'express'
import { getDoctorRatings, getPendingRatings } from '../controllers/ratingController'
import { verifyToken, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// Get doctor ratings and statistics
router.get('/doctor/:doctorId', getDoctorRatings)

// Get patient's pending ratings (meetings that need to be rated)
router.get('/pending', verifyToken, requireRole('patient'), getPendingRatings)

export default router
