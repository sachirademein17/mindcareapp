// 📁 backend/src/controllers/meeting.controller.ts
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { DoctorAvailability, Meeting, Rating, User, DoctorDetails, Enrollment } from '../models'

// Define AuthRequest interface based on the existing auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    [key: string]: any
  }
}

// Doctor Availability Management
export const setDoctorAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { dayOfWeek, startTime, endTime, isActive } = req.body
    const doctorId = parseInt(req.user?.id || '0')

    // Validate doctor role
    const doctor = await User.findByPk(doctorId, {
      include: [{ model: DoctorDetails, as: 'DoctorDetail' }]
    })

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can set availability' })
    }

    // Create or update availability
    const [availability, created] = await DoctorAvailability.upsert({
      doctorId: doctorId,
      dayOfWeek,
      startTime,
      endTime,
      isActive: isActive !== undefined ? isActive : true
    })

    res.status(created ? 201 : 200).json({
      message: created ? 'Availability created' : 'Availability updated',
      availability
    })
  } catch (error) {
    console.error('Error setting doctor availability:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getDoctorAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params

    const availability = await DoctorAvailability.findAll({
      where: {
        doctorId: parseInt(doctorId),
        isActive: true
      },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    })

    res.json({ availabilities: availability })
  } catch (error) {
    console.error('Error fetching doctor availability:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateDoctorAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { availabilityId } = req.params
    const { dayOfWeek, startTime, endTime, isActive } = req.body
    const doctorId = parseInt(req.user?.id || '0')

    // Find the availability record
    const availability = await DoctorAvailability.findOne({
      where: {
        id: parseInt(availabilityId),
        doctorId
      }
    })

    if (!availability) {
      return res.status(404).json({ error: 'Availability not found' })
    }

    // Update the availability
    await availability.update({
      dayOfWeek,
      startTime,
      endTime,
      isActive: isActive !== undefined ? isActive : true
    })

    res.json({
      message: 'Availability updated successfully',
      availability
    })
  } catch (error) {
    console.error('Error updating doctor availability:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteDoctorAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { availabilityId } = req.params
    const doctorId = parseInt(req.user?.id || '0')

    // Find and delete the availability record
    const deleted = await DoctorAvailability.destroy({
      where: {
        id: parseInt(availabilityId),
        doctorId
      }
    })

    if (!deleted) {
      return res.status(404).json({ error: 'Availability not found' })
    }

    res.json({ message: 'Availability deleted successfully' })
  } catch (error) {
    console.error('Error deleting doctor availability:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date } = req.query

    if (!doctorId || !date) {
      return res.status(400).json({ error: 'Doctor ID and date are required' })
    }

    const selectedDate = new Date(date as string)
    const dayOfWeek = selectedDate.getDay()

    // Get doctor's availability for this day
    const availability = await DoctorAvailability.findAll({
      where: {
        doctorId: parseInt(doctorId as string),
        dayOfWeek,
        isActive: true
      }
    })

    if (availability.length === 0) {
      return res.json([])
    }

    // Get existing bookings for this day
    const existingMeetings = await Meeting.findAll({
      where: {
        doctorId: parseInt(doctorId as string),
        meetingDate: date as string,
        status: { [Op.in]: ['pending', 'approved'] }
      }
    })

    const bookedSlots = existingMeetings.map(meeting => meeting.startTime)

    // Generate available slots
    const availableSlots: string[] = []

    availability.forEach(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0])
      const endHour = parseInt(slot.endTime.split(':')[0])

      for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${String(hour).padStart(2, '0')}:00`
        if (!bookedSlots.includes(timeSlot)) {
          availableSlots.push(timeSlot)
        }
      }
    })

    res.json(availableSlots.sort())
  } catch (error) {
    console.error('Error fetching available slots:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Meeting Booking - Simplified without payment
export const bookMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, enrollmentId, meetingDate, startTime, patientNotes } = req.body
    const patientId = parseInt(req.user?.id || '0')

    // Validate patient
    if (!patientId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check enrollment exists and is active
    const enrollment = await Enrollment.findOne({
      where: {
        id: enrollmentId,
        patientId,
        doctorId,
        status: 'approved'
      }
    })

    if (!enrollment) {
      return res.status(404).json({ error: 'Active enrollment not found' })
    }

    // Get doctor details for consultation fee - need to cast to any for associations
    const doctor = await User.findByPk(doctorId, {
      include: [{ model: DoctorDetails, as: 'DoctorDetail' }]
    }) as any

    if (!doctor?.DoctorDetail?.consultationFee) {
      return res.status(400).json({ error: 'Doctor consultation fee not set' })
    }

    // Calculate end time (1 hour later)
    const startHour = parseInt(startTime.split(':')[0])
    const endTime = `${String(startHour + 1).padStart(2, '0')}:00`

    // Check if slot is available
    const existingMeeting = await Meeting.findOne({
      where: {
        doctorId,
        meetingDate,
        startTime,
        status: { [Op.in]: ['pending', 'approved'] }
      }
    })

    if (existingMeeting) {
      return res.status(409).json({ error: 'Time slot already booked' })
    }

    // Check doctor availability for this day/time
    const dayOfWeek = new Date(meetingDate).getDay()
    const availability = await DoctorAvailability.findOne({
      where: {
        doctorId,
        dayOfWeek,
        startTime: { [Op.lte]: startTime },
        endTime: { [Op.gte]: endTime },
        isActive: true
      }
    })

    if (!availability) {
      return res.status(400).json({ error: 'Doctor not available at this time' })
    }

    // Create meeting directly without payment
    const meeting = await Meeting.create({
      patientId,
      doctorId,
      enrollmentId,
      meetingDate,
      startTime,
      endTime,
      patientNotes,
      consultationFee: doctor.DoctorDetail.consultationFee,
      status: 'pending', // Doctor needs to approve
      requestedAt: new Date(),
      canRefund: false
    })

    // Include doctor details in response
    const meetingWithDoctor = await Meeting.findByPk(meeting.id, {
      include: [
        {
          model: User,
          as: 'Doctor',
          include: [{ model: DoctorDetails, as: 'DoctorDetail' }]
        }
      ]
    })

    res.status(201).json({
      message: 'Meeting request submitted successfully',
      meeting: meetingWithDoctor
    })
  } catch (error) {
    console.error('Error booking meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get patient meetings
export const getPatientMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = parseInt(req.user?.id || '0')

    const meetings = await Meeting.findAll({
      where: { patientId },
      include: [
        {
          model: User,
          as: 'Doctor',
          include: [{ model: DoctorDetails, as: 'DoctorDetail' }]
        },
        { model: Rating, as: 'Rating' }
      ],
      order: [['meetingDate', 'ASC'], ['startTime', 'ASC']]
    })

    res.json(meetings)
  } catch (error) {
    console.error('Error fetching patient meetings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get doctor meetings
export const getDoctorMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = parseInt(req.user?.id || '0')

    const meetings = await Meeting.findAll({
      where: { doctorId },
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'Doctor',
          include: [{ model: DoctorDetails, as: 'DoctorDetail' }]
        },
        { model: Rating, as: 'Rating' }
      ],
      order: [['meetingDate', 'ASC'], ['startTime', 'ASC']]
    })

    res.json({ meetings })
  } catch (error) {
    console.error('Error fetching doctor meetings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Approve meeting
export const approveMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const doctorId = parseInt(req.user?.id || '0')

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        doctorId,
        status: 'pending'
      }
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or already processed' })
    }

    // Check if meeting is paid
    if (!meeting.isPaid || meeting.paymentStatus !== 'paid') {
      return res.status(400).json({ error: 'Meeting must be paid before approval' })
    }

    // Generate Jitsi meeting URL
    const meetingUrl = `https://meet.jit.si/mindcare-${meetingId}-${Date.now()}`

    await meeting.update({
      status: 'approved',
      approvedAt: new Date(),
      meetingUrl
    })

    // Send approval notification to patient
    const { NotificationService } = await import('../services/NotificationService')
    const notificationService = new NotificationService()
    
    await notificationService.createMeetingApprovalNotification(
      meeting.patientId,
      Number(meetingId),
      doctorId,
      meetingUrl
    )

    res.json({
      message: 'Meeting approved successfully',
      meeting
    })
  } catch (error) {
    console.error('Error approving meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Decline meeting
export const declineMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const { reason } = req.body
    const doctorId = parseInt(req.user?.id || '0')

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        doctorId,
        status: 'pending'
      }
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or already processed' })
    }

    // Import payment service for refund processing
    const { paymentService } = await import('../services/PaymentService')
    const { NotificationService } = await import('../services/NotificationService')
    const notificationService = new NotificationService()

    // Process refund if meeting was paid
    if (meeting.isPaid && meeting.paymentStatus === 'paid') {
      try {
        await paymentService.processRefundForDeclinedMeeting(
          Number(meetingId),
          reason || 'Meeting declined by doctor'
        )
      } catch (refundError) {
        console.error('Error processing refund:', refundError)
        // Continue with declining the meeting even if refund fails
        // The refund can be processed manually later
      }
    } else {
      // Update meeting status even if no payment to refund
      await meeting.update({
        status: 'declined',
        declinedAt: new Date(),
        declineReason: reason || 'Meeting declined by doctor'
      })

      // Send decline notification to patient
      await notificationService.createMeetingDeclineNotification(
        meeting.patientId,
        Number(meetingId),
        doctorId,
        reason || 'Meeting declined by doctor'
      )
    }

    res.json({
      message: 'Meeting declined successfully',
      meeting: await Meeting.findByPk(meetingId) // Return updated meeting
    })
  } catch (error) {
    console.error('Error declining meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Complete meeting
export const completeMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const { doctorNotes } = req.body
    const doctorId = parseInt(req.user?.id || '0')

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
      doctorNotes,
      completedAt: new Date()
    })

    res.json({
      message: 'Meeting completed successfully',
      meeting
    })
  } catch (error) {
    console.error('Error completing meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Cancel meeting
export const cancelMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const { reason } = req.body
    const userId = parseInt(req.user?.id || '0')

    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        [Op.or]: [
          { patientId: userId },
          { doctorId: userId }
        ],
        status: { [Op.in]: ['pending', 'approved'] }
      }
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or cannot be cancelled' })
    }

    await meeting.update({
      status: 'cancelled',
      declineReason: reason,
      cancelledAt: new Date()
    })

    res.json({
      message: 'Meeting cancelled successfully',
      meeting
    })
  } catch (error) {
    console.error('Error cancelling meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Rate doctor
export const rateMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const {
      rating,
      comment,
      communicationRating,
      professionalismRating,
      knowledgeRating,
      overallSatisfaction,
      wouldRecommend,
      isAnonymous
    } = req.body
    const patientId = parseInt(req.user?.id || '0')

    // Check if meeting exists and is completed
    const meeting = await Meeting.findOne({
      where: {
        id: meetingId,
        patientId,
        status: 'completed'
      }
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or not completed' })
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
      where: { meetingId }
    })

    if (existingRating) {
      return res.status(409).json({ error: 'Meeting already rated' })
    }

    // Create rating
    const newRating = await Rating.create({
      meetingId: parseInt(meetingId),
      patientId,
      doctorId: meeting.doctorId,
      rating,
      comment,
      communicationRating,
      professionalismRating,
      knowledgeRating,
      overallSatisfaction,
      wouldRecommend: wouldRecommend || false,
      isAnonymous: isAnonymous || false
    })

    // Update meeting with rating
    await meeting.update({
      rating,
      ratingComment: comment
    })

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    })
  } catch (error) {
    console.error('Error rating meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get patient statistics
export const getPatientStats = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = parseInt(req.user?.id || '0')

    if (!patientId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Get total meetings count by status
    const totalMeetings = await Meeting.count({
      where: { patientId }
    })

    const pendingMeetings = await Meeting.count({
      where: { patientId, status: 'pending' }
    })

    const approvedMeetings = await Meeting.count({
      where: { patientId, status: 'approved' }
    })

    const completedMeetings = await Meeting.count({
      where: { patientId, status: 'completed' }
    })

    const declinedMeetings = await Meeting.count({
      where: { patientId, status: 'declined' }
    })

    const cancelledMeetings = await Meeting.count({
      where: { patientId, status: 'cancelled' }
    })

    // Get next upcoming meeting
    const nextMeeting = await Meeting.findOne({
      where: {
        patientId,
        status: 'approved',
        meetingDate: {
          [Op.gte]: new Date()
        }
      },
      order: [['meetingDate', 'ASC'], ['startTime', 'ASC']],
      include: [
        {
          model: User,
          as: 'Doctor',
          include: [{ model: DoctorDetails, as: 'DoctorDetail' }]
        }
      ]
    })

    // Get recent completed meetings for rating prompts
    const recentCompletedMeetings = await Meeting.findAll({
      where: {
        patientId,
        status: 'completed'
      },
      order: [['completedAt', 'DESC']],
      limit: 3,
      include: [
        {
          model: User,
          as: 'Doctor',
          include: [{ model: DoctorDetails, as: 'DoctorDetail' }]
        }
      ]
    })

    res.json({
      success: true,
      stats: {
        totalMeetings,
        pendingMeetings,
        approvedMeetings,
        completedMeetings,
        declinedMeetings,
        cancelledMeetings,
        nextMeeting,
        recentCompletedMeetings
      }
    })
  } catch (error) {
    console.error('Error getting patient stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
