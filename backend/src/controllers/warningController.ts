// 📁 backend/src/controllers/warningController.ts
import { Request, Response } from 'express'
import { Warning } from '../models/Warning'
import { User } from '../models/User'
import { Op, fn, col } from 'sequelize'

// Submit a warning/complaint
export const submitWarning = async (req: Request, res: Response) => {
  try {
    console.log('🚨 Warning submission received:', req.body)
    console.log('👤 User:', req.user)
    
    if (!req.user) {
      console.log('❌ No user in request')
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const {
      reportedUserId,
      reportedUserType,
      category,
      title,
      description,
      severity
    } = req.body

    // Validate required fields
    if (!reportedUserId || !reportedUserType || !category || !title || !description) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Verify reported user exists
    const reportedUser = await User.findByPk(reportedUserId)
    if (!reportedUser) {
      return res.status(404).json({ error: 'Reported user not found' })
    }

    // Verify user types match the actual user roles
    if (reportedUser.role !== reportedUserType) {
      return res.status(400).json({ error: 'Invalid reported user type' })
    }

    // Check if user is trying to report themselves
    if (parseInt(req.user.id.toString()) === parseInt(reportedUserId.toString())) {
      return res.status(400).json({ error: 'You cannot report yourself' })
    }

    // Create the warning
    const warning = await Warning.create({
      reporterId: parseInt(req.user.id.toString()),
      reporterType: req.user.role as 'patient' | 'doctor',
      reportedUserId: parseInt(reportedUserId.toString()),
      reportedUserType,
      category,
      title,
      description,
      severity: severity || 'medium'
    })

    console.log(`🚨 New warning submitted: ID ${warning.id} by ${req.user.role} ${req.user.id} against ${reportedUserType} ${reportedUserId}`)

    res.status(201).json({
      message: 'Warning submitted successfully',
      warningId: warning.id
    })
  } catch (error) {
    console.error('Error submitting warning:', error)
    res.status(500).json({ error: 'Failed to submit warning' })
  }
}

// Get user's submitted warnings
export const getMyWarnings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const warnings = await Warning.findAll({
      where: { reporterId: parseInt(req.user.id.toString()) },
      include: [
        {
          model: User,
          as: 'ReportedUser',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'Admin',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json(warnings)
  } catch (error) {
    console.error('Error fetching user warnings:', error)
    res.status(500).json({ error: 'Failed to fetch warnings' })
  }
}

// Admin: Get all warnings
export const getAllWarnings = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Admin trying to fetch all warnings')
    console.log('👤 User:', req.user)
    
    if (!req.user || req.user.role !== 'admin') {
      console.log('❌ Access denied - not admin or no user')
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { status, severity, category, page = 1, limit = 20 } = req.query

    const whereClause: any = {}
    
    if (status) whereClause.status = status
    if (severity) whereClause.severity = severity
    if (category) whereClause.category = category

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    const { count, rows: warnings } = await Warning.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Reporter',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'ReportedUser',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'Admin',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit as string),
      offset
    })

    console.log(`✅ Found ${count} warnings for admin`)

    // For now, just return the warnings array to match frontend expectations
    res.json(warnings)
  } catch (error) {
    console.error('Error fetching all warnings:', error)
    res.status(500).json({ error: 'Failed to fetch warnings' })
  }
}

// Admin: Update warning status
export const updateWarningStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { warningId } = req.params
    const { status, adminNotes } = req.body

    if (!status || !['pending', 'under_review', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    const warning = await Warning.findByPk(warningId)
    if (!warning) {
      return res.status(404).json({ error: 'Warning not found' })
    }

    await warning.update({
      status,
      adminNotes: adminNotes || warning.adminNotes,
      adminId: parseInt(req.user.id)
    })

    console.log(`🔧 Warning ${warningId} status updated to ${status} by admin ${req.user.id}`)

    res.json({
      message: 'Warning status updated successfully',
      warning
    })
  } catch (error) {
    console.error('Error updating warning status:', error)
    res.status(500).json({ error: 'Failed to update warning status' })
  }
}

// Admin: Get warning statistics
export const getWarningStats = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const totalWarnings = await Warning.count()
    const pendingWarnings = await Warning.count({ where: { status: 'pending' } })
    const underReviewWarnings = await Warning.count({ where: { status: 'under_review' } })
    const resolvedWarnings = await Warning.count({ where: { status: 'resolved' } })
    const dismissedWarnings = await Warning.count({ where: { status: 'dismissed' } })

    const criticalWarnings = await Warning.count({ where: { severity: 'critical' } })
    const highWarnings = await Warning.count({ where: { severity: 'high' } })

    const categoryStats = await Warning.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    })

    res.json({
      total: totalWarnings,
      byStatus: {
        pending: pendingWarnings,
        under_review: underReviewWarnings,
        resolved: resolvedWarnings,
        dismissed: dismissedWarnings
      },
      bySeverity: {
        critical: criticalWarnings,
        high: highWarnings
      },
      byCategory: categoryStats
    })
  } catch (error) {
    console.error('Error fetching warning stats:', error)
    res.status(500).json({ error: 'Failed to fetch warning statistics' })
  }
}
