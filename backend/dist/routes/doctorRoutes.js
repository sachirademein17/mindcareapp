"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 📁 backend/src/routes/doctorRoutes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const doctorController_1 = require("../controllers/doctorController");
const router = (0, express_1.Router)();
// Middleware to require doctor role
const requireDoctor = [auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('doctor')];
router.get('/enrollments', requireDoctor, doctorController_1.getEnrolledPatients);
router.get('/pending-enrollments', requireDoctor, doctorController_1.getPendingEnrollments);
router.patch('/enrollment/:enrollmentId/approve', requireDoctor, doctorController_1.approveEnrollment);
router.patch('/enrollment/:enrollmentId/reject', requireDoctor, doctorController_1.rejectEnrollment);
router.post('/prescription', requireDoctor, doctorController_1.issuePrescription);
exports.default = router;
// 📁 backend/src/routes/doctorRoutes.ts
