import { Router } from 'express'
import { 
  enrollDoctor, 
  filterDoctors, 
  getEnrolledDoctors,
  getAllEnrollments, 
  cancelEnrollment, 
  getEnrollmentStatus,
  getEnrollmentStatusByDoctor,
  cancelEnrollmentByDoctor
} from '../controllers/patientController'
import { verifyToken, requireRole, checkSuspension } from '../middlewares/auth.middleware'

const router = Router()

// Middleware to require patient role and check suspension
const requirePatient = [verifyToken, checkSuspension, requireRole('patient')]

router.get('/enrollments', requirePatient, getEnrolledDoctors)
router.get('/all-enrollments', requirePatient, getAllEnrollments)
router.get('/filter-doctors', requirePatient, filterDoctors)
router.post('/enroll/:doctorId', requirePatient, enrollDoctor)
router.delete('/enrollment/:enrollmentId', requirePatient, cancelEnrollment)
router.delete('/cancel-enrollment/:doctorId', requirePatient, cancelEnrollmentByDoctor)
router.get('/enrollment/:enrollmentId', requirePatient, getEnrollmentStatus)
router.get('/enrollment-status/:doctorId', requirePatient, getEnrollmentStatusByDoctor)

export default router
