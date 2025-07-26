"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/patient/signup', auth_controller_1.patientSignup);
router.post('/patient/login', auth_controller_1.patientLogin);
router.post('/doctor/signup', upload_middleware_1.upload.fields([{ name: 'licenseFile', maxCount: 1 }, { name: 'cvFile', maxCount: 1 }]), auth_controller_1.doctorSignup);
router.post('/doctor/login', auth_controller_1.doctorLogin);
router.post('/admin/login', auth_controller_1.adminLogin);
// Profile routes - require authentication
router.get('/profile', auth_middleware_1.verifyToken, auth_controller_1.getProfile);
router.put('/profile', auth_middleware_1.verifyToken, auth_controller_1.updateProfile);
router.put('/change-password', auth_middleware_1.verifyToken, auth_controller_1.changePassword);
exports.default = router;
