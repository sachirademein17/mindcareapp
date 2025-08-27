import { Request, Response } from 'express'
import { User } from '../models/User'
import { Enrollment } from '../models/Enrollment'
import { DoctorDetails } from '../models/DoctorDetails'
import { Op } from 'sequelize'

export const getEnrolledDoctors = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const patientId = parseInt(req.user.id)

    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' })
    }

    console.log('🔍 Fetching enrollments for patient:', patientId)

    const enrollments = await Enrollment.findAll({
      where: { patientId, status: 'approved' },
      include: [{ model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }]
    })

    console.log('📋 Found enrollments:', enrollments.length)
    console.log('📄 Enrollment details:', JSON.stringify(enrollments, null, 2))

    res.json(enrollments)
  } catch (error) {
    console.error('Error fetching enrolled doctors:', error)
    res.status(500).json({ error: 'Failed to fetch enrolled doctors' })
  }
}

export const getAllEnrollments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const patientId = parseInt(req.user.id)

    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' })
    }

    const enrollments = await Enrollment.findAll({
      where: { patientId },
      include: [{ model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    })

    res.json(enrollments)
  } catch (error) {
    console.error('Error fetching all enrollments:', error)
    res.status(500).json({ error: 'Failed to fetch enrollments' })
  }
}


export const filterDoctors = async (req: Request, res: Response) => {
  const { location, language } = req.query

  try {
    const whereCondition: any = {
      approved: true
    }

    // Add location filter if provided
    if (location && typeof location === 'string' && location.trim() !== '') {
      whereCondition.location = { [Op.iLike]: `%${location}%` }
    }

    // Add language filter if provided
    if (language && typeof language === 'string' && language.trim() !== '') {
      whereCondition.languages = { [Op.iLike]: `%${language}%` }
    }

    const doctors = await User.findAll({
      where: { role: 'doctor' },
      include: [{
        model: DoctorDetails,
        as: 'DoctorDetail',
        required: true,
        where: whereCondition
      }],
      attributes: ['id', 'name', 'email']
    })

    res.json(doctors)
  } catch (error) {
    console.error('Error filtering doctors:', error)
    res.status(500).json({ error: 'Failed to filter doctors' })
  }
}


export const enrollDoctor = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      console.log('Enrollment failed: User not authenticated')
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const patientId = parseInt(req.user.id)
    const doctorId = parseInt(req.params.doctorId)

    console.log('Enrollment attempt:', { patientId, doctorId, userRole: req.user.role })

    if (isNaN(doctorId) || isNaN(patientId)) {
      console.log('Enrollment failed: Invalid IDs', { doctorId, patientId })
      return res.status(400).json({ error: 'Invalid IDs provided' })
    }

    // Check if doctor exists and is approved
    const doctor = await User.findOne({
      where: { id: doctorId, role: 'doctor' },
      include: [{ model: DoctorDetails, as: 'DoctorDetail', where: { approved: true } }]
    })

    if (!doctor) {
      console.log('Enrollment failed: Doctor not found or not approved', { doctorId })
      return res.status(404).json({ error: 'Doctor not found or not approved' })
    }

    const existing = await Enrollment.findOne({ where: { doctorId, patientId } })
    if (existing) {
      console.log('Enrollment failed: Already enrolled', { doctorId, patientId, existingStatus: existing.status })
      return res.status(400).json({ error: 'Already enrolled' })
    }

    const enrollment = await Enrollment.create({
      doctorId,
      patientId,
      status: 'approved'
    })

    console.log('Enrollment successful:', enrollment.toJSON())
    res.json({ message: 'Successfully enrolled with doctor', enrollment })
  } catch (error) {
    console.error('Error enrolling doctor:', error)
    res.status(500).json({ error: 'Enrollment failed' })
  }
}

export const cancelEnrollment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const patientId = parseInt(req.user.id)
    const enrollmentId = parseInt(req.params.enrollmentId)

    if (isNaN(patientId) || isNaN(enrollmentId)) {
      return res.status(400).json({ error: 'Invalid IDs provided' })
    }

    const enrollment = await Enrollment.findOne({ where: { id: enrollmentId, patientId } })
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' })

    await enrollment.destroy()
    res.json({ message: 'Enrollment cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling enrollment:', error)
    res.status(500).json({ error: 'Failed to cancel enrollment' })
  }
}

export const getEnrollmentStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const patientId = parseInt(req.user.id)
    const enrollmentId = parseInt(req.params.enrollmentId)

    if (isNaN(patientId) || isNaN(enrollmentId)) {
      return res.status(400).json({ error: 'Invalid IDs provided' })
    }

    const enrollment = await Enrollment.findOne({
      where: { id: enrollmentId, patientId },
      include: [{ model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }]
    })

    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' })

    res.json(enrollment)
  } catch (error) {
    console.error('Error fetching enrollment status:', error)
    res.status(500).json({ error: 'Failed to fetch enrollment status' })
  }
}

export const getEnrollmentStatusByDoctor = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const patientId = parseInt(req.user.id)
    const doctorId = parseInt(req.params.doctorId)

    if (isNaN(doctorId) || isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid IDs provided' })
    }

    const enrollment = await Enrollment.findOne({ 
      where: { doctorId, patientId } 
    })

    if (!enrollment) {
      return res.status(404).json({ error: 'No enrollment found' })
    }

    res.json({ status: enrollment.status, enrollment })
  } catch (error) {
    console.error('Error checking enrollment status:', error)
    res.status(500).json({ error: 'Failed to check enrollment status' })
  }
}

export const cancelEnrollmentByDoctor = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const patientId = parseInt(req.user.id)
    const doctorId = parseInt(req.params.doctorId)

    if (isNaN(doctorId) || isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid IDs provided' })
    }

    const enrollment = await Enrollment.findOne({ 
      where: { doctorId, patientId, status: 'pending' } 
    })

    if (!enrollment) {
      return res.status(404).json({ error: 'No pending enrollment found with this doctor' })
    }

    await enrollment.destroy()
    res.json({ message: 'Enrollment request cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling enrollment:', error)
    res.status(500).json({ error: 'Failed to cancel enrollment' })
  }
}

export const getDoctorDetails = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params

    const doctor = await User.findByPk(doctorId, {
      include: [{ model: DoctorDetails, as: 'DoctorDetail' }]
    })

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' })
    }

    res.json(doctor)
  } catch (error) {
    console.error('Error fetching doctor details:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}