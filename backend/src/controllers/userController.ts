import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { User } from '../models/User'

// Get current user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const userId = parseInt(req.user.id)
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
}

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const userId = parseInt(req.user.id)
    const { name, email, nic, gender, dob, phone } = req.body

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ 
        where: { email },
        attributes: ['id']
      })
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email is already taken' })
      }
    }

    // Update user
    const [updatedRowsCount] = await User.update({
      name,
      email,
      nic,
      gender,
      dob: dob ? new Date(dob) : undefined,
      phone
    }, {
      where: { id: userId }
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Return updated user data
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    })

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ error: 'Failed to update user profile' })
  }
}

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const userId = parseInt(req.user.id)
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' })
    }

    // Get user with password to verify current password
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await User.update({
      password: hashedNewPassword
    }, {
      where: { id: userId }
    })

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
}

// Delete user account
export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const userId = parseInt(req.user.id)
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' })
    }

    // Get user to verify password
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Incorrect password' })
    }

    // Delete user account
    await User.destroy({ where: { id: userId } })

    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting user account:', error)
    res.status(500).json({ error: 'Failed to delete account' })
  }
}
