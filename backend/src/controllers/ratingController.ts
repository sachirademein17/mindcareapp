// 🌟 Get Doctor Ratings Controller
import { Request, Response } from 'express'
import { Rating, User, Meeting } from '../models'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    [key: string]: any
  }
}

// Get doctor ratings and statistics
export const getDoctorRatings = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params

    // Get all ratings for this doctor
    const ratings = await Rating.findAll({
      where: { doctorId: parseInt(doctorId) },
      order: [['createdAt', 'DESC']]
    })

    if (ratings.length === 0) {
      return res.json({
        averageRating: 0,
        totalRatings: 0,
        ratingBreakdown: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        },
        categoryAverages: {
          communication: 0,
          professionalism: 0,
          knowledge: 0,
          satisfaction: 0
        },
        recommendationRate: 0,
        recentRatings: []
      })
    }

    // Calculate statistics
    const totalRatings = ratings.length
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings

    // Rating breakdown (1-5 stars)
    const ratingBreakdown = {
      5: ratings.filter(r => r.rating === 5).length,
      4: ratings.filter(r => r.rating === 4).length,
      3: ratings.filter(r => r.rating === 3).length,
      2: ratings.filter(r => r.rating === 2).length,
      1: ratings.filter(r => r.rating === 1).length
    }

    // Category averages (with null checks)
    const commRatings = ratings.filter(r => r.communicationRating != null)
    const profRatings = ratings.filter(r => r.professionalismRating != null)
    const knowRatings = ratings.filter(r => r.knowledgeRating != null)
    const satRatings = ratings.filter(r => r.overallSatisfaction != null)

    const categoryAverages = {
      communication: commRatings.length > 0 ? commRatings.reduce((sum, r) => sum + r.communicationRating!, 0) / commRatings.length : 0,
      professionalism: profRatings.length > 0 ? profRatings.reduce((sum, r) => sum + r.professionalismRating!, 0) / profRatings.length : 0,
      knowledge: knowRatings.length > 0 ? knowRatings.reduce((sum, r) => sum + r.knowledgeRating!, 0) / knowRatings.length : 0,
      satisfaction: satRatings.length > 0 ? satRatings.reduce((sum, r) => sum + r.overallSatisfaction!, 0) / satRatings.length : 0
    }

    // Recommendation rate
    const recommendationRate = (ratings.filter(r => r.wouldRecommend).length / totalRatings) * 100

    // Recent ratings (last 10, sanitized for privacy)
    const recentRatings = ratings.slice(0, 10).map(rating => ({
      id: rating.id,
      rating: rating.rating,
      comment: rating.comment,
      communicationRating: rating.communicationRating,
      professionalismRating: rating.professionalismRating,
      knowledgeRating: rating.knowledgeRating,
      overallSatisfaction: rating.overallSatisfaction,
      wouldRecommend: rating.wouldRecommend,
      isAnonymous: rating.isAnonymous,
      patientName: rating.isAnonymous ? 'Anonymous' : 'Patient',
      createdAt: rating.createdAt
    }))

    res.json({
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratingBreakdown,
      categoryAverages: {
        communication: Math.round(categoryAverages.communication * 10) / 10,
        professionalism: Math.round(categoryAverages.professionalism * 10) / 10,
        knowledge: Math.round(categoryAverages.knowledge * 10) / 10,
        satisfaction: Math.round(categoryAverages.satisfaction * 10) / 10
      },
      recommendationRate: Math.round(recommendationRate),
      recentRatings
    })
  } catch (error) {
    console.error('Error fetching doctor ratings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get patient's completed meetings that need rating
export const getPendingRatings = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = parseInt(req.user?.id || '0')

    // Get completed meetings without ratings
    const meetingsToRate = await Meeting.findAll({
      where: {
        patientId,
        status: 'completed'
      },
      order: [['completedAt', 'DESC']]
    })

    // Filter meetings that don't have ratings yet
    const pendingRatings = []
    
    for (const meeting of meetingsToRate) {
      const existingRating = await Rating.findOne({
        where: { meetingId: meeting.id }
      })
      
      if (!existingRating) {
        // Get doctor info
        const doctor = await User.findByPk(meeting.doctorId, {
          attributes: ['id', 'name']
        })
        
        pendingRatings.push({
          meetingId: meeting.id,
          doctorName: doctor?.name || 'Unknown Doctor',
          doctorId: meeting.doctorId,
          meetingDate: meeting.meetingDate,
          completedAt: meeting.completedAt,
          consultationFee: meeting.consultationFee
        })
      }
    }

    res.json({
      pendingRatings,
      totalPending: pendingRatings.length
    })
  } catch (error) {
    console.error('Error fetching pending ratings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
