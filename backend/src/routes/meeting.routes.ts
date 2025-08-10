import { Router } from 'express'
import { verifyToken, checkSuspension } from '../middlewares/auth.middleware'
import { roleMiddleware } from '../middlewares/role.middleware'
import {
  requestMeeting,
  respondToMeeting,
  getPatientMeetings,
  getDoctorMeetings,
  getPendingMeetings,
  cancelMeeting,
  completeMeeting
} from '../controllers/meeting.controller'

const router = Router()

// Apply auth middleware to all routes
router.use(verifyToken)
router.use(checkSuspension)

// Patient routes
router.post('/request', roleMiddleware(['patient']), requestMeeting)
router.get('/patient', roleMiddleware(['patient']), getPatientMeetings)
router.patch('/cancel/:id', roleMiddleware(['patient']), cancelMeeting)

// Doctor routes
router.patch('/respond/:id', roleMiddleware(['doctor']), respondToMeeting)
router.get('/doctor', roleMiddleware(['doctor']), getDoctorMeetings)
router.get('/pending', roleMiddleware(['doctor']), getPendingMeetings)
router.patch('/complete/:id', roleMiddleware(['doctor']), completeMeeting)

export { router as meetingRoutes }
