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

    // Create meeting with appropriate status based on consultation fee
    const requiresPayment = doctor.DoctorDetail.consultationFee > 0
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
      paymentStatus: requiresPayment ? 'unpaid' : 'paid', // Set payment status based on fee
      isPaid: !requiresPayment, // Mark as paid if no payment required
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
      meeting: meetingWithDoctor,
      paymentRequired: requiresPayment,
      consultationFee: doctor.DoctorDetail.consultationFee
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

    res.json({ meetings })
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

    // Check payment requirement based on consultation fee
    const requiresPayment = meeting.consultationFee > 0
    
    if (requiresPayment) {
      // For paid consultations: Check if payment is in escrow (pending status)
      // Patient pays -> money held in escrow -> doctor approves -> money transferred
      if (meeting.paymentStatus !== 'pending' && meeting.paymentStatus !== 'paid') {
        return res.status(400).json({ 
          error: 'Payment must be completed before approval',
          message: 'Patient must complete payment before doctor can approve the meeting',
          consultationFee: meeting.consultationFee,
          paymentStatus: meeting.paymentStatus,
          isPaid: meeting.isPaid
        })
      }
      
      // Transfer money from escrow to doctor on approval
      if (meeting.paymentStatus === 'pending') {
        await meeting.update({
          isPaid: true,
          paymentStatus: 'paid'
        })
      }
    } else {
      // If consultation fee is 0, no payment required - mark as paid
      await meeting.update({
        isPaid: true,
        paymentStatus: 'paid'
      })
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
      },
      include: [
        { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
      ]
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or already processed' })
    }

    const declineReason = reason || 'Meeting declined by doctor'
    let refundProcessed = false
    let refundAmount = 0

    // Simple refund logic - if consultation fee > 0, create direct refund
    if (meeting.consultationFee > 0 && meeting.paymentStatus === 'paid') {
      try {
        console.log(`� Processing direct refund for declined meeting ${meetingId}`)
        console.log(`📊 Consultation fee: $${meeting.consultationFee}`)

        // Create a simulated refund - in real system this would call Stripe/payment processor
        refundAmount = meeting.consultationFee
        refundProcessed = true

        console.log(`✅ Simulated refund of $${refundAmount} processed`)

        // Update meeting with refund status
        await meeting.update({
          status: 'declined',
          paymentStatus: 'refunded',
          declinedAt: new Date(),
          declineReason,
          isPaid: false,
          // Refund tracking fields
          refundAmount,
          refundDate: new Date(),
          refundReason: `Doctor declined: ${declineReason}`,
          refundType: 'full',
          refundProcessed: true
        })

        // Send notification to patient
        const { NotificationService } = await import('../services/NotificationService')
        const notificationService = new NotificationService()
        
        await notificationService.createRefundNotification(
          meeting.patientId,
          0, // No payment ID in this simplified version
          Number(meetingId),
          refundAmount,
          `Your meeting with Dr. ${(meeting as any).Doctor?.name} was declined. Reason: ${declineReason}. A full refund of $${refundAmount} has been processed and will appear in your account within 5-10 business days.`
        )

        return res.json({
          message: 'Meeting declined and full refund processed successfully',
          refundProcessed: true,
          refundAmount,
          refundDetails: {
            originalAmount: meeting.consultationFee,
            refundAmount,
            refundType: 'full',
            processingTime: '5-10 business days',
            reason: declineReason
          },
          meeting: await Meeting.findByPk(meetingId, {
            include: [
              { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
              { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
            ]
          })
        })
      } catch (refundError: any) {
        console.error('❌ Error processing refund:', refundError)
        // Continue to decline meeting even if refund fails
      }
    }

    // Decline meeting (with or without refund)
    await meeting.update({
      status: 'declined',
      declinedAt: new Date(),
      declineReason,
      paymentStatus: meeting.consultationFee > 0 && !refundProcessed ? 'failed' : meeting.paymentStatus
    })

    // Send appropriate notification
    const { NotificationService } = await import('../services/NotificationService')
    const notificationService = new NotificationService()

    if (refundProcessed) {
      // Already sent refund notification above
    } else {
      await notificationService.createMeetingDeclineNotification(
        meeting.patientId,
        Number(meetingId),
        doctorId,
        declineReason
      )
    }

    // Prepare response
    let responseMessage = 'Meeting declined successfully'
    if (meeting.consultationFee > 0) {
      if (refundProcessed) {
        responseMessage = `Meeting declined and full refund of $${refundAmount} processed successfully`
      } else if (meeting.paymentStatus === 'paid') {
        responseMessage = 'Meeting declined - refund will be processed separately'
      } else {
        responseMessage = 'Meeting declined - no payment to refund'
      }
    }

    res.json({
      message: responseMessage,
      refundProcessed,
      refundAmount,
      consultationFee: meeting.consultationFee,
      paymentStatus: meeting.paymentStatus,
      meeting: await Meeting.findByPk(meetingId, {
        include: [
          { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
        ]
      })
    })
  } catch (error) {
    console.error('❌ Error declining meeting:', error)
    
    // Fallback - ensure meeting is declined
    try {
      const { meetingId } = req.params
      const { reason } = req.body
      
      await Meeting.update(
        {
          status: 'declined',
          declinedAt: new Date(),
          declineReason: reason || 'Meeting declined by doctor'
        },
        { where: { id: meetingId } }
      )
      
      res.json({
        message: 'Meeting declined (with processing errors)',
        refundProcessed: false,
        warning: 'Meeting declined but refund processing failed'
      })
    } catch (finalError) {
      console.error('❌ Final fallback failed:', finalError)
      res.status(500).json({ 
        error: 'Unable to decline meeting',
        details: 'Please contact support'
      })
    }
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
      },
      include: [
        { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
      ]
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or cannot be cancelled' })
    }

    // Determine who is cancelling
    const cancelledBy = meeting.patientId === userId ? 'patient' : 'doctor'
    const cancelReason = reason || `Meeting cancelled by ${cancelledBy}`

    // Calculate refund based on timing
    const meetingDateTime = new Date(`${meeting.meetingDate}T${meeting.startTime}:00`)
    const now = new Date()
    const hoursUntilMeeting = (meetingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundProcessed = false
    let refundAmount = 0
    let refundType = 'none'

    // Simple refund logic based on meeting fee and timing
    if (meeting.consultationFee > 0 && meeting.paymentStatus === 'paid') {
      if (hoursUntilMeeting >= 24) {
        // Full refund for cancellations 24+ hours in advance
        refundAmount = meeting.consultationFee
        refundType = 'full'
        refundProcessed = true
      } else if (hoursUntilMeeting > 0) {
        // Partial refund for cancellations less than 24 hours
        refundAmount = meeting.consultationFee * 0.5
        refundType = 'partial'
        refundProcessed = true
      }
      // No refund for cancellations after meeting time (hoursUntilMeeting <= 0)

      if (refundProcessed) {
        console.log(`💰 Processing ${refundType} refund of $${refundAmount} for cancelled meeting ${meetingId}`)

        // Update meeting with cancellation and refund status
        await meeting.update({
          status: 'cancelled',
          paymentStatus: 'refunded',
          cancelledAt: new Date(),
          declineReason: cancelReason,
          isPaid: false,
          // Refund tracking fields
          refundAmount,
          refundDate: new Date(),
          refundReason: `Cancelled by ${cancelledBy}: ${cancelReason}`,
          refundType: (refundType as 'full' | 'partial' | 'none'),
          refundProcessed: true
        })

        // Send refund notification
        const { NotificationService } = await import('../services/NotificationService')
        const notificationService = new NotificationService()

        const refundMessage = refundType === 'full'
          ? `Your meeting was cancelled. You received a full refund of $${refundAmount.toFixed(2)}.`
          : `Your meeting was cancelled with ${hoursUntilMeeting.toFixed(1)} hours notice. You received a partial refund of $${refundAmount.toFixed(2)} (50% due to late cancellation).`

        await notificationService.createRefundNotification(
          meeting.patientId,
          0, // No payment ID in simplified version
          Number(meetingId),
          refundAmount,
          refundMessage
        )

        return res.json({
          message: `Meeting cancelled and ${refundType} refund processed successfully`,
          refundProcessed: true,
          refundType,
          refundAmount,
          refundDetails: {
            originalAmount: meeting.consultationFee,
            refundAmount,
            refundPercentage: refundType === 'full' ? 100 : 50,
            hoursUntilMeeting: hoursUntilMeeting.toFixed(2),
            processingTime: '5-10 business days'
          },
          meeting: await Meeting.findByPk(meetingId, {
            include: [
              { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
              { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
            ]
          })
        })
      }
    }

    // Cancel meeting without refund (free consultation or no refund eligibility)
    await meeting.update({
      status: 'cancelled',
      declineReason: cancelReason,
      cancelledAt: new Date(),
      paymentStatus: meeting.consultationFee > 0 ? 'failed' : meeting.paymentStatus
    })

    // Send cancellation notification for free consultations
    if (meeting.consultationFee === 0) {
      const { NotificationService } = await import('../services/NotificationService')
      const notificationService = new NotificationService()
      
      await notificationService.createMeetingDeclineNotification(
        meeting.patientId,
        Number(meetingId),
        meeting.doctorId,
        cancelReason
      )
    }

    // Prepare response message
    let responseMessage = 'Meeting cancelled successfully'
    if (meeting.consultationFee > 0) {
      if (hoursUntilMeeting <= 0) {
        responseMessage = 'Meeting cancelled - no refund (meeting time has passed)'
      } else if (meeting.paymentStatus !== 'paid') {
        responseMessage = 'Meeting cancelled - no payment to refund'
      } else {
        responseMessage = 'Meeting cancelled - refund not applicable due to timing'
      }
    }

    res.json({
      message: responseMessage,
      refundProcessed: false,
      refundAmount: 0,
      refundType: 'none',
      hoursUntilMeeting: hoursUntilMeeting.toFixed(2),
      consultationFee: meeting.consultationFee,
      paymentStatus: meeting.paymentStatus,
      meeting: await Meeting.findByPk(meetingId, {
        include: [
          { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'Doctor', attributes: ['id', 'name', 'email'] }
        ]
      })
    })
  } catch (error) {
    console.error('❌ Error cancelling meeting:', error)
    
    // Fallback - ensure meeting is cancelled
    try {
      const { meetingId } = req.params
      const { reason } = req.body
      const userId = parseInt(req.user?.id || '0')
      
      const meeting = await Meeting.findByPk(meetingId)
      const cancelledBy = meeting?.patientId === userId ? 'patient' : 'doctor'
      
      await Meeting.update(
        {
          status: 'cancelled',
          declineReason: reason || `Meeting cancelled by ${cancelledBy}`,
          cancelledAt: new Date()
        },
        { where: { id: meetingId } }
      )
      
      res.json({
        message: 'Meeting cancelled (with processing errors)',
        refundProcessed: false,
        warning: 'Meeting cancelled but refund processing failed'
      })
    } catch (finalError) {
      console.error('❌ Final fallback failed:', finalError)
      res.status(500).json({ 
        error: 'Unable to cancel meeting',
        details: 'Please contact support'
      })
    }
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









