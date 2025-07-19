"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patientController_1 = require("../controllers/patientController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Middleware to require patient role
const requirePatient = [auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('patient')];
router.get('/enrollments', requirePatient, patientController_1.getEnrolledDoctors);
router.get('/all-enrollments', requirePatient, patientController_1.getAllEnrollments);
router.get('/filter-doctors', requirePatient, patientController_1.filterDoctors);
router.post('/enroll/:doctorId', requirePatient, patientController_1.enrollDoctor);
router.delete('/enrollment/:enrollmentId', requirePatient, patientController_1.cancelEnrollment);
router.delete('/cancel-enrollment/:doctorId', requirePatient, patientController_1.cancelEnrollmentByDoctor);
router.get('/enrollment/:enrollmentId', requirePatient, patientController_1.getEnrollmentStatus);
router.get('/enrollment-status/:doctorId', requirePatient, patientController_1.getEnrollmentStatusByDoctor);
router.get('/prescriptions', requirePatient, patientController_1.getPrescriptions);
exports.default = router;
