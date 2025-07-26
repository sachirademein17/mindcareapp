import express, { Request, Response } from 'express'
import { User } from '../models/User'
import { DoctorDetails } from '../models/DoctorDetails'
import { verifyToken, requireRole } from '../middlewares/auth.middleware'

const router = express.Router()

// Middleware to require admin role
const requireAdmin = [verifyToken, requireRole('admin')]

// GET all users
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      include: [{
        model: DoctorDetails,
        as: 'DoctorDetail', // Use the correct alias
        required: false // LEFT JOIN to include users without doctor details
      }],
      attributes: { exclude: ['password'] } // Don't send passwords
    })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Approve doctor
router.put('/approve-doctor/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const doctor = await DoctorDetails.findOne({ where: { userId: req.params.id } })
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' })
    
    // Update both DoctorDetails and User approval status
    await doctor.update({ approved: true })
    await User.update({ isApproved: true }, { where: { id: req.params.id } })
    
    res.json({ message: 'Doctor approved successfully' })
  } catch (error) {
    console.error('Error approving doctor:', error)
    res.status(500).json({ error: 'Failed to approve doctor' })
  }
})

// Delete user
router.delete('/user/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    
    await user.destroy()
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

export default router
