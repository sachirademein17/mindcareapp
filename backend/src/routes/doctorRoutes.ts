// 📁 backend/src/routes/doctorRoutes.ts
import { Router } from 'express'
import { verifyToken, requireRole, checkSuspension } from '../middlewares/auth.middleware'
import { 
  getEnrolledPatients
} from '../controllers/doctorController'

const router = Router()

// Middleware to require doctor role and check suspension
const requireDoctor = [verifyToken, checkSuspension, requireRole('doctor')]

router.get('/enrollments', requireDoctor, getEnrolledPatients)

export default router