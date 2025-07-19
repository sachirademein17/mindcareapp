// 📁 backend/src/controllers/doctorController.ts
import { Request, Response } from 'express'
import { User } from '../models/User'
import { Enrollment } from '../models/Enrollment'
import { Prescription } from '../models/Prescription'


export const getEnrolledPatients = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const doctorId = req.user.id

    const enrollments = await Enrollment.findAll({
      where: { doctorId, status: 'approved' },
      include: [
        { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] }
      ]
    })
    res.json(enrollments)
  } catch (error) {
    console.error('Error fetching enrolled patients:', error)
    res.status(500).json({ error: 'Failed to fetch patients' })
  }
}

export const issuePrescription = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const { enrollmentId, notes } = req.body

    const prescription = await Prescription.create({ enrollmentId, notes })
    res.status(201).json(prescription)
  } catch (error) {
    console.error('Error issuing prescription:', error)
    res.status(500).json({ error: 'Failed to issue prescription' })
  }
}

export const getPendingEnrollments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const doctorId = req.user.id

    const pendingEnrollments = await Enrollment.findAll({
      where: { doctorId, status: 'pending' },
      include: [
        { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    })
    res.json(pendingEnrollments)
  } catch (error) {
    console.error('Error fetching pending enrollments:', error)
    res.status(500).json({ error: 'Failed to fetch pending enrollments' })
  }
}

export const approveEnrollment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const doctorId = req.user.id
    const enrollmentId = parseInt(req.params.enrollmentId)

    if (isNaN(enrollmentId)) {
      return res.status(400).json({ error: 'Invalid enrollment ID' })
    }

    const enrollment = await Enrollment.findOne({
      where: { id: enrollmentId, doctorId, status: 'pending' }
    })

    if (!enrollment) {
      return res.status(404).json({ error: 'Pending enrollment not found' })
    }

    await enrollment.update({ status: 'approved' })
    res.json({ message: 'Enrollment approved successfully', enrollment })
  } catch (error) {
    console.error('Error approving enrollment:', error)
    res.status(500).json({ error: 'Failed to approve enrollment' })
  }
}

export const rejectEnrollment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const doctorId = req.user.id
    const enrollmentId = parseInt(req.params.enrollmentId)

    if (isNaN(enrollmentId)) {
      return res.status(400).json({ error: 'Invalid enrollment ID' })
    }

    const enrollment = await Enrollment.findOne({
      where: { id: enrollmentId, doctorId, status: 'pending' }
    })

    if (!enrollment) {
      return res.status(404).json({ error: 'Pending enrollment not found' })
    }

    await enrollment.update({ status: 'rejected' })
    res.json({ message: 'Enrollment rejected successfully', enrollment })
  } catch (error) {
    console.error('Error rejecting enrollment:', error)
    res.status(500).json({ error: 'Failed to reject enrollment' })
  }
}