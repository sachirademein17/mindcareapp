// 📁 backend/src/controllers/meeting.controller.ts
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { DoctorAvailability, Meeting, Payment, Rating, User, DoctorDetails, Enrollment } from '../models'
import Stripe from 'stripe'

// Define AuthRequest interface based on the existing auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    [key: string]: any
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
})

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

export const getDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params

    const availabilities = await DoctorAvailability.findAll({
      where: { 
        doctorId,
        isActive: true
      },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    })

    res.json({ availabilities })
  } catch (error) {
    console.error('Error getting doctor availability:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateDoctorAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { availabilityId } = req.params
    const { dayOfWeek, startTime, endTime, isActive } = req.body
    const doctorId = parseInt(req.user?.id || '0')

    // Find the availability record
    const availability = await DoctorAvailability.findByPk(availabilityId)
    
    if (!availability) {
      return res.status(404).json({ error: 'Availability not found' })
    }

    // Check if the availability belongs to the authenticated doctor
    if (availability.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized to modify this availability' })
    }

    // Update the availability
    await availability.update({
      dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : availability.dayOfWeek,
      startTime: startTime !== undefined ? startTime : availability.startTime,
      endTime: endTime !== undefined ? endTime : availability.endTime,
      isActive: isActive !== undefined ? isActive : availability.isActive
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

    // Find the availability record
    const availability = await DoctorAvailability.findByPk(availabilityId)
    
    if (!availability) {
      return res.status(404).json({ error: 'Availability not found' })
    }

    // Check if the availability belongs to the authenticated doctor
    if (availability.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized to delete this availability' })
    }

    // Delete the availability
    await availability.destroy()

    res.json({
      message: 'Availability deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting doctor availability:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Meeting Booking
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

    // TEMPORARILY DISABLED STRIPE PAYMENT FOR TESTING
    // Create a simple booking without payment for now
    
    // Set refund deadline (1 day from now)
    const refundDeadline = new Date()
    refundDeadline.setDate(refundDeadline.getDate() + 1)

    // Create meeting
    const meeting = await Meeting.create({
      patientId,
      doctorId,
      enrollmentId,
      meetingDate,
      startTime,
      endTime,
      patientNotes,
      consultationFee: doctor.DoctorDetail.consultationFee,
      paymentStatus: 'pending', // Will be updated when Stripe is configured
      refundDeadline,
      requestedAt: new Date()
    })

    res.status(201).json({
      message: 'Meeting booked successfully (payment will be processed later)',
      meeting
    })
  } catch (error) {
    console.error('Error booking meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Doctor Meeting Management
export const approveMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const { doctorNotes } = req.body
    const doctorId = parseInt(req.user?.id || '0')

    const meeting = await Meeting.findOne({
      where: {
        id: parseInt(meetingId),
        doctorId,
        status: 'pending'
      }
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or already processed' })
    }

    // Generate Jitsi meeting URL
    const meetingUrl = `https://meet.jit.si/mindcare-${meeting.id}-${Date.now()}`

    await meeting.update({
      status: 'approved',
      doctorNotes,
      meetingUrl,
      approvedAt: new Date()
    })

    res.json({
      message: 'Meeting approved successfully',
      meeting
    })
  } catch (error) {
    console.error('Error approving meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const declineMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const { declineReason } = req.body
    const doctorId = parseInt(req.user?.id || '0')

    const meeting = await Meeting.findOne({
      where: {
        id: parseInt(meetingId),
        doctorId,
        status: 'pending'
      }
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or already processed' })
    }

    // Get payment record separately
    const payment = await Payment.findOne({
      where: { meetingId: meeting.id }
    })

    // Refund payment if it was paid
    if (payment && meeting.paymentStatus === 'paid') {
      await stripe.refunds.create({
        payment_intent: meeting.paymentIntentId!
      })

      await payment.update({
        status: 'refunded',
        refundAmount: payment.amount,
        refundReason: 'Meeting declined by doctor',
        refundedAt: new Date()
      })

      await meeting.update({
        paymentStatus: 'refunded'
      })
    }

    await meeting.update({
      status: 'declined',
      declineReason,
      declinedAt: new Date()
    })

    res.json({
      message: 'Meeting declined and payment refunded',
      meeting
    })
  } catch (error) {
    console.error('Error declining meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get meetings for doctor/patient
export const getDoctorMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = parseInt(req.user?.id || '0')
    const { status, date } = req.query

    const whereClause: any = { doctorId }
    if (status) whereClause.status = status
    if (date) whereClause.meetingDate = date

    const meetings = await Meeting.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'Patient', attributes: ['id', 'name', 'email'] },
        { model: Payment, as: 'Payment' },
        { model: Rating, as: 'Rating' }
      ],
      order: [['meetingDate', 'ASC'], ['startTime', 'ASC']]
    })

    res.json({ meetings })
  } catch (error) {
    console.error('Error getting doctor meetings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getPatientMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = parseInt(req.user?.id || '0')
    const { status, date } = req.query

    const whereClause: any = { patientId }
    if (status) whereClause.status = status
    if (date) whereClause.meetingDate = date

    const meetings = await Meeting.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'Doctor', 
          attributes: ['id', 'name', 'email'],
          include: [{ model: DoctorDetails, as: 'DoctorDetail' }]
        },
        { model: Payment, as: 'Payment' },
        { model: Rating, as: 'Rating' }
      ],
      order: [['meetingDate', 'ASC'], ['startTime', 'ASC']]
    })

    res.json({ meetings })
  } catch (error) {
    console.error('Error getting patient meetings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Meeting completion and rating
export const completeMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId } = req.params
    const userId = parseInt(req.user?.id || '0')

    const meeting = await Meeting.findOne({
      where: {
        id: parseInt(meetingId),
        [Op.or]: [
          { doctorId: userId },
          { patientId: userId }
        ],
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

    res.json({
      message: 'Meeting marked as completed',
      meeting
    })
  } catch (error) {
    console.error('Error completing meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

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

    const meeting = await Meeting.findOne({
      where: {
        id: parseInt(meetingId),
        patientId,
        status: 'completed'
      }
    })

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or not completed' })
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      where: { meetingId: parseInt(meetingId) }
    })

    if (existingRating) {
      return res.status(409).json({ error: 'Meeting already rated' })
    }

    const ratingRecord = await Rating.create({
      meetingId: parseInt(meetingId),
      patientId,
      doctorId: meeting.doctorId,
      rating,
      comment,
      communicationRating,
      professionalismRating,
      knowledgeRating,
      overallSatisfaction,
      wouldRecommend,
      isAnonymous: isAnonymous || false
    })

    // Update meeting with rating
    await meeting.update({
      rating,
      ratingComment: comment
    })

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: ratingRecord
    })
  } catch (error) {
    console.error('Error rating meeting:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Payment webhook
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'

    let event
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } catch (err: any) {
      console.log('Webhook signature verification failed:', err.message)
      return res.status(400).send('Webhook signature verification failed')
    }

    // Handle payment success
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Update payment and meeting status
      const payment = await Payment.findOne({
        where: { stripePaymentIntentId: paymentIntent.id }
      })

      if (payment) {
        await payment.update({
          status: 'succeeded',
          stripePaymentId: paymentIntent.id,
          paymentMethod: paymentIntent.payment_method_types[0]
        })

        await Meeting.update(
          { paymentStatus: 'paid' },
          { where: { id: payment.meetingId } }
        )
      }
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Error handling Stripe webhook:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get doctor ratings
export const getDoctorRatings = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params
    const { page = 1, limit = 10 } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    const ratings = await Rating.findAndCountAll({
      where: { 
        doctorId,
        isApproved: true
      },
      include: [
        { 
          model: User, 
          as: 'Patient', 
          attributes: ['username'] // Only show username if not anonymous
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    })

    // Calculate average ratings
    const avgRating = await Rating.findAll({
      where: { doctorId, isApproved: true },
      attributes: [
        [Rating.sequelize!.fn('AVG', Rating.sequelize!.col('rating')), 'averageRating'],
        [Rating.sequelize!.fn('AVG', Rating.sequelize!.col('communicationRating')), 'avgCommunication'],
        [Rating.sequelize!.fn('AVG', Rating.sequelize!.col('professionalismRating')), 'avgProfessionalism'],
        [Rating.sequelize!.fn('AVG', Rating.sequelize!.col('knowledgeRating')), 'avgKnowledge'],
        [Rating.sequelize!.fn('AVG', Rating.sequelize!.col('overallSatisfaction')), 'avgSatisfaction'],
        [Rating.sequelize!.fn('COUNT', Rating.sequelize!.col('id')), 'totalRatings']
      ],
      raw: true
    })

    res.json({
      ratings: ratings.rows,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(ratings.count / Number(limit)),
        totalItems: ratings.count,
        itemsPerPage: Number(limit)
      },
      averages: avgRating[0]
    })
  } catch (error) {
    console.error('Error getting doctor ratings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
