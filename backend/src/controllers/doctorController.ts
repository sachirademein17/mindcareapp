// 📁 backend/src/controllers/doctorController.ts
import { Request, Response } from 'express'
import { User } from '../models/User'
import { Enrollment } from '../models/Enrollment'


export const getEnrolledPatients = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Doctor enrollments endpoint called')
    console.log('🔍 Request headers:', req.headers.authorization)
    console.log('🔍 Request user:', req.user)
    
    if (!req.user) {
      console.log('❌ No user in request')
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const doctorId = req.user.id
    console.log('🔍 Doctor ID:', doctorId, 'Type:', typeof doctorId)

    const enrollments = await Enrollment.findAll({
      where: { doctorId, status: 'approved' },
      include: [
        { model: User, as: 'Patient', attributes: ['id', 'name', 'email', 'nic'] }
      ]
    })
    console.log('🔍 Found enrollments:', enrollments.length)
    res.json(enrollments)
  } catch (error) {
    console.error('❌ Error fetching enrolled patients:', error)
    res.status(500).json({ error: 'Failed to fetch patients' })
  }
}