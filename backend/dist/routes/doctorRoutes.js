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
router.post('/issue-multiple-prescriptions', requireDoctor, doctorController_1.issueMultiplePrescriptions);
exports.default = router;
// 📁 backend/src/routes/doctorRoutes.ts
