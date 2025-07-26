import { Router } from 'express'
import { patientSignup, patientLogin, doctorSignup, doctorLogin, adminLogin, getProfile, updateProfile, changePassword } from '../controllers/auth.controller'
import { upload } from '../middlewares/upload.middleware'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()

router.post('/patient/signup', patientSignup)
router.post('/patient/login', patientLogin)
router.post('/doctor/signup', upload.fields([{ name: 'licenseFile', maxCount: 1 }, { name: 'cvFile', maxCount: 1 }]), doctorSignup)
router.post('/doctor/login', doctorLogin)
router.post('/admin/login', adminLogin)

// Profile routes - require authentication
router.get('/profile', verifyToken, getProfile)
router.put('/profile', verifyToken, updateProfile)
router.put('/change-password', verifyToken, changePassword)

export default router
