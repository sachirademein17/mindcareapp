"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 📁 backend/src/routes/doctorRoutes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const doctorController_1 = require("../controllers/doctorController");
const router = (0, express_1.Router)();
// Middleware to require doctor role and check suspension
const requireDoctor = [auth_middleware_1.verifyToken, auth_middleware_1.checkSuspension, (0, auth_middleware_1.requireRole)('doctor')];
router.get('/enrollments', requireDoctor, doctorController_1.getEnrolledPatients);
exports.default = router;
