import { Router } from 'express'
import { patientSignup, patientLogin, doctorSignup, doctorLogin, adminLogin } from '../controllers/auth.controller'
import { upload } from '../middlewares/upload.middleware'

const router = Router()

router.post('/patient/signup', patientSignup)
router.post('/patient/login', patientLogin)
router.post('/doctor/signup', upload.single('cv'), doctorSignup)
router.post('/doctor/login', doctorLogin)
router.post('/admin/login', adminLogin)

export default router
