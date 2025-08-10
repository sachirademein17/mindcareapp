import { Request, Response } from 'express'
import { Meeting } from '../models/Meeting'
import { User } from '../models/User'
import { DoctorDetails } from '../models/DoctorDetails'
import { Enrollment } from '../models/Enrollment'
import { v4 as uuidv4 } from 'uuid'

// Patient requests a meeting
export const requestMeeting = async (req: Request, res: Response) => {
  try {
    const patientId = parseInt(req.user?.id as string)
    const { doctorId, enrollmentId, scheduledAt, patientNotes, duration = 60 } = req.body

    console.log('🎯 Meeting request received:', { patientId, doctorId, enrollmentId, scheduledAt })

    // Verify enrollment exists and is approved
    const enrollment = await Enrollment.findOne({
      where: { 
        id: enrollmentId,
        patientId,
        doctorId,
        status: 'approved'
      }
    })

    if (!enrollment) {
      return res.status(400).json({ error: 'Invalid enrollment or not approved' })
    }

    // Check if meeting time is in the future
    const meetingTime = new Date(scheduledAt)
    if (meetingTime <= new Date()) {
      return res.status(400).json({ error: 'Meeting time must be in the future' })
    }

    // Check for conflicting meetings
    const conflictingMeeting = await Meeting.findOne({
      where: {
        doctorId,
        scheduledAt: meetingTime,
        status: ['pending', 'approved']
      }
    })

    if (conflictingMeeting) {
      return res.status(400).json({ error: 'Doctor already has a meeting scheduled at this time' })
    }

    const meeting = await Meeting.create({
      patientId,
      doctorId: parseInt(doctorId),
      enrollmentId: parseInt(enrollmentId),
      scheduledAt: meetingTime,
      patientNotes,
      duration: parseInt(duration),
      status: 'pending',
      requestedAt: new Date()
    })

    console.log('✅ Meeting created successfully:', meeting.id)

    res.status(201).json({ 
      message: 'Meeting request sent successfully',
      meeting 
    })
  } catch (error: any) {
    console.error('❌ Error requesting meeting:', error)
    res.status(500).json({ error: 'Failed to request meeting' })
  }
}

// Doctor responds to meeting request
export const respondToMeeting = async (req: Request, res: Response) => {
  try {
    const doctorId = parseInt(req.user?.id as string)
    const meetingId = parseInt(req.params.id)
    const { status, doctorNotes, rejectionReason } = req.body

    console.log('🩺 Doctor responding to meeting:', { meetingId, status, doctorId, body: req.body })

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected"' })
    }

    const meeting = await Meeting.findOne({
      where: { id: meetingId, doctorId, status: 'pending' }
    })

    if (!meeting) {
      console.log('❌ Meeting not found:', { meetingId, doctorId })
      return res.status(404).json({ error: 'Meeting not found or already processed' })
    }

    const updateData: any = {
      status,
      doctorNotes
    }

    if (status === 'approved') {
      updateData.approvedAt = new Date()
      // Generate Jitsi Meet room URL with a unique room name
      const roomName = `mindcare-meeting-${meeting.id}-${Date.now()}`
      updateData.meetingUrl = `https://meet.jit.si/${roomName}`
    } else if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason
    }

    await meeting.update(updateData)

    console.log('✅ Meeting response processed:', meeting.id, 'Status:', status)

    res.json({ 
      message: `Meeting ${status} successfully`,
      meeting 
    })
  } catch (error: any) {
    console.error('❌ Error responding to meeting:', error)
    res.status(500).json({ error: 'Failed to respond to meeting' })
  }
}

// Get patient's meetings
export const getPatientMeetings = async (req: Request, res: Response) => {
  try {
    const patientId = parseInt(req.user?.id as string)

    const meetings = await Meeting.findAll({
      where: { patientId },
      include: [
        {
          model: User,
          as: 'Doctor',
          attributes: ['id', 'name', 'email'],
          include: [{
            model: DoctorDetails,
            as: 'DoctorDetail',
            attributes: ['specialization']
          }]
        }
      ],
      order: [['scheduledAt', 'ASC']]
    })

    res.json({ meetings })
  } catch (error: any) {
    console.error('❌ Error fetching patient meetings:', error)
    res.status(500).json({ error: 'Failed to fetch meetings' })
  }
}

// Get doctor's meetings
export const getDoctorMeetings = async (req: Request, res: Response) => {
  try {
    const doctorId = parseInt(req.user?.id as string)

    const meetings = await Meeting.findAll({
      where: { doctorId },
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['scheduledAt', 'ASC']]
    })

    res.json({ meetings })
  } catch (error: any) {
    console.error('❌ Error fetching doctor meetings:', error)
    res.status(500).json({ error: 'Failed to fetch meetings' })
  }
}

// Get pending meetings for doctor
export const getPendingMeetings = async (req: Request, res: Response) => {
  try {
    const doctorId = parseInt(req.user?.id as string)

    const meetings = await Meeting.findAll({
      where: { 
        doctorId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['requestedAt', 'DESC']]
    })

    res.json({ meetings })
  } catch (error: any) {
    console.error('❌ Error fetching pending meetings:', error)
    res.status(500).json({ error: 'Failed to fetch pending meetings' })
  }
}

// Cancel meeting (patient only)
export const cancelMeeting = async (req: Request, res: Response) => {
  try {
    const patientId = parseInt(req.user?.id as string)
    const meetingId = parseInt(req.params.id)

    const meeting = await Meeting.findOne({
      where: { 
        id: meetingId, 
        patientId,
        status: ['pending', 'approved']
      }
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or cannot be cancelled' })
    }

    await meeting.update({
      status: 'cancelled',
      cancelledAt: new Date()
    })

    console.log('❌ Meeting cancelled by patient:', meeting.id)

    res.json({ message: 'Meeting cancelled successfully' })
  } catch (error: any) {
    console.error('❌ Error cancelling meeting:', error)
    res.status(500).json({ error: 'Failed to cancel meeting' })
  }
}

// Mark meeting as completed (doctor only)
export const completeMeeting = async (req: Request, res: Response) => {
  try {
    const doctorId = parseInt(req.user?.id as string)
    const meetingId = parseInt(req.params.id)

    const meeting = await Meeting.findOne({
      where: { 
        id: meetingId, 
        doctorId,
        status: 'approved'
      }
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or not approved' })
    }

    await meeting.update({
      status: 'completed',
      completedAt: new Date()
    })

    console.log('✅ Meeting marked as completed:', meeting.id)

    res.json({ message: 'Meeting marked as completed' })
  } catch (error: any) {
    console.error('❌ Error completing meeting:', error)
    res.status(500).json({ error: 'Failed to complete meeting' })
  }
}
