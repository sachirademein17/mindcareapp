"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 📁 backend/src/routes/meetingRoutes.ts
const express_1 = __importDefault(require("express"));
const meeting_controller_1 = require("../controllers/meeting.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Doctor Availability Routes
router.post('/availability', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('doctor'), auth_middleware_1.checkSuspension, meeting_controller_1.setDoctorAvailability);
router.get('/availability/:doctorId', meeting_controller_1.getDoctorAvailability);
// Meeting Booking Routes
router.post('/book', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('patient'), auth_middleware_1.checkSuspension, meeting_controller_1.bookMeeting);
// Doctor Meeting Management Routes
router.put('/:meetingId/approve', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('doctor'), auth_middleware_1.checkSuspension, meeting_controller_1.approveMeeting);
router.put('/:meetingId/decline', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('doctor'), auth_middleware_1.checkSuspension, meeting_controller_1.declineMeeting);
// Meeting Viewing Routes
router.get('/doctor', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('doctor'), auth_middleware_1.checkSuspension, meeting_controller_1.getDoctorMeetings);
router.get('/patient', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('patient'), auth_middleware_1.checkSuspension, meeting_controller_1.getPatientMeetings);
// Meeting Completion and Rating
router.put('/:meetingId/complete', auth_middleware_1.verifyToken, auth_middleware_1.checkSuspension, meeting_controller_1.completeMeeting);
router.post('/:meetingId/rate', auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('patient'), auth_middleware_1.checkSuspension, meeting_controller_1.rateMeeting);
// Rating and Reviews
router.get('/ratings/:doctorId', meeting_controller_1.getDoctorRatings);
// Stripe Webhook (no auth required, Stripe handles verification)
router.post('/webhook/stripe', express_1.default.raw({ type: 'application/json' }), meeting_controller_1.handleStripeWebhook);
exports.default = router;
