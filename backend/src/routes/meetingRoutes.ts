import express from 'express'
import {
  setDoctorAvailability,
  getDoctorAvailability,
  updateDoctorAvailability,
  deleteDoctorAvailability,
  getAvailableSlots,
  bookMeeting,
  approveMeeting,
  declineMeeting,
  getDoctorMeetings,
  getPatientMeetings,
  completeMeeting,
  rateMeeting,
  cancelMeeting,
  getPatientStats
} from '../controllers/meeting.controller'
import { verifyToken, requireRole, checkSuspension } from '../middlewares/auth.middleware'

const router = express.Router()

// Doctor Availability Routes
router.post('/availability', verifyToken, requireRole('doctor'), checkSuspension, setDoctorAvailability)
router.get('/availability/:doctorId', getDoctorAvailability)
router.put('/availability/:availabilityId', verifyToken, requireRole('doctor'), checkSuspension, updateDoctorAvailability)
router.delete('/availability/:availabilityId', verifyToken, requireRole('doctor'), checkSuspension, deleteDoctorAvailability)
router.get('/available-slots', getAvailableSlots)

// Meeting Booking Routes
router.post('/book', verifyToken, requireRole('patient'), checkSuspension, bookMeeting)

// Doctor Meeting Management Routes
router.put('/:meetingId/approve', verifyToken, requireRole('doctor'), checkSuspension, approveMeeting)
router.put('/:meetingId/decline', verifyToken, requireRole('doctor'), checkSuspension, declineMeeting)

// Meeting Viewing Routes
router.get('/doctor', verifyToken, requireRole('doctor'), checkSuspension, getDoctorMeetings)
router.get('/patient', verifyToken, requireRole('patient'), checkSuspension, getPatientMeetings)

// Patient Stats Route
router.get('/patient/stats', verifyToken, requireRole('patient'), checkSuspension, getPatientStats)

// Meeting Completion and Rating
router.put('/:meetingId/complete', verifyToken, checkSuspension, completeMeeting)
router.post('/:meetingId/rate', verifyToken, requireRole('patient'), checkSuspension, rateMeeting)

// Meeting Cancellation
router.put('/:meetingId/cancel', verifyToken, checkSuspension, cancelMeeting)

export default router
