import { Router } from 'express'
import { verifyToken } from '../middlewares/auth.middleware'
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  deleteUserAccount 
} from '../controllers/userController'

const router = Router()

// All routes require authentication
router.use(verifyToken)

// Get user profile
router.get('/profile', getUserProfile)

// Update user profile
router.put('/profile', updateUserProfile)

// Change password
router.put('/change-password', changePassword)

// Delete user account
router.delete('/account', deleteUserAccount)

export default router
