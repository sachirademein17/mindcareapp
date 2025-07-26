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
        { model: User, as: 'Patient', attributes: ['id', 'name', 'email', 'nic'] }
      ]
    })
    res.json(enrollments)
  } catch (error) {
    console.error('Error fetching enrolled patients:', error)
    res.status(500).json({ error: 'Failed to fetch patients' })
  }
}

export const issueMultiplePrescriptions = async (req: Request, res: Response) => {
  try {
    console.log('🔔 issueMultiplePrescriptions called with body:', req.body) // Debug log
    
    if (!req.user) {
      console.log('❌ User not authenticated')
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    console.log('✅ User authenticated:', req.user.id) // Debug log
    const { prescriptions } = req.body

    if (!prescriptions || !Array.isArray(prescriptions) || prescriptions.length === 0) {
      console.log('❌ Invalid prescriptions array:', prescriptions)
      return res.status(400).json({ error: 'Prescriptions array is required' })
    }

    console.log('✅ Prescriptions array valid, length:', prescriptions.length) // Debug log

    // Validate that all prescriptions have required fields
    for (const prescription of prescriptions) {
      if (!prescription.patientId || !prescription.patientNIC || !prescription.drugName || 
          !prescription.dosage || !prescription.frequency || !prescription.duration || 
          !prescription.instructions) {
        console.log('❌ Missing required fields in prescription:', prescription)
        return res.status(400).json({ error: 'All prescription fields are required' })
      }
    }

    console.log('✅ All prescriptions have required fields') // Debug log

    // Find enrollment ID for the patient
    const patientId = prescriptions[0].patientId
    console.log('🔍 Looking for enrollment for patient:', patientId, 'doctor:', req.user.id) // Debug log
    
    const enrollment = await Enrollment.findOne({
      where: { 
        patientId: patientId,
        doctorId: req.user.id,
        status: 'approved'
      }
    })

    if (!enrollment) {
      console.log('❌ Patient enrollment not found or not approved')
      return res.status(404).json({ error: 'Patient enrollment not found or not approved' })
    }

    console.log('✅ Enrollment found:', enrollment.id) // Debug log

    // Create all prescriptions
    console.log('📝 Creating prescriptions...') // Debug log
    const createdPrescriptions = await Promise.all(
      prescriptions.map(prescription => 
        Prescription.create({
          enrollmentId: enrollment.id,
          patientId: prescription.patientId,
          patientNIC: prescription.patientNIC,
          drugName: prescription.drugName,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          instructions: prescription.instructions,
          notes: prescription.notes || ''
        })
      )
    )

    console.log('✅ Prescriptions created successfully:', createdPrescriptions.length) // Debug log

    res.status(201).json({ 
      message: `${createdPrescriptions.length} prescription(s) issued successfully`,
      prescriptions: createdPrescriptions 
    })
  } catch (error) {
    console.error('❌ Error issuing multiple prescriptions:', error)
    res.status(500).json({ error: 'Failed to issue prescriptions' })
  }
}