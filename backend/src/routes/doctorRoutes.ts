// 📁 backend/src/routes/doctorRoutes.ts
import { Router } from 'express'
import { verifyToken, requireRole } from '../middlewares/auth.middleware'
import { 
  getEnrolledPatients, 
  issueMultiplePrescriptions
} from '../controllers/doctorController'

const router = Router()

// Middleware to require doctor role
const requireDoctor = [verifyToken, requireRole('doctor')]

router.get('/enrollments', requireDoctor, getEnrolledPatients)
router.post('/issue-multiple-prescriptions', requireDoctor, issueMultiplePrescriptions)

export default router
// 📁 backend/src/routes/doctorRoutes.ts