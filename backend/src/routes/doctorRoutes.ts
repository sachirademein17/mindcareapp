// 📁 backend/src/routes/doctorRoutes.ts
import { Router } from 'express'
import { verifyToken, requireRole } from '../middlewares/auth.middleware'
import { 
  getEnrolledPatients, 
  issuePrescription, 
  getPendingEnrollments, 
  approveEnrollment, 
  rejectEnrollment 
} from '../controllers/doctorController'

const router = Router()

// Middleware to require doctor role
const requireDoctor = [verifyToken, requireRole('doctor')]

router.get('/enrollments', requireDoctor, getEnrolledPatients)
router.get('/pending-enrollments', requireDoctor, getPendingEnrollments)
router.patch('/enrollment/:enrollmentId/approve', requireDoctor, approveEnrollment)
router.patch('/enrollment/:enrollmentId/reject', requireDoctor, rejectEnrollment)
router.post('/prescription', requireDoctor, issuePrescription)

export default router
// 📁 backend/src/routes/doctorRoutes.ts