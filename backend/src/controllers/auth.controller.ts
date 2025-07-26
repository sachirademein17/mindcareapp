import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import { User } from '../models/User'
import { DoctorDetails } from '../models/DoctorDetails'

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret'

export const patientSignup = async (req: Request, res: Response) => {
  try {
    console.log('Patient signup request:', req.body) // Debug log
    const { name, email, password, nic, gender, dob, phone } = req.body
    
    // Check if user already exists (by email or NIC)
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email },
          { nic }
        ]
      } 
    })
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'User with this email already exists' })
      }
      if (existingUser.nic === nic) {
        return res.status(400).json({ error: 'User with this NIC already exists' })
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      nic, 
      gender, 
      dob: dob ? new Date(dob) : undefined, 
      phone, 
      role: 'patient' 
    })
    
    console.log('Patient created successfully:', user.id) // Debug log
    res.status(201).json({ message: 'Patient registered successfully', user: { id: user.id, name: user.name, email: user.email } })
  } catch (err: any) {
    console.error('Patient signup error:', err)
    res.status(500).json({ error: err.message || 'Registration failed' })
  }
}

export const patientLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email, role: 'patient' } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, role: 'patient' }, JWT_SECRET, { expiresIn: '1d' })
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err })
  }
}

export const doctorSignup = async (req: Request, res: Response) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone,
      nic,
      specialization, 
      licenseNumber,
      experience,
      district,
      qualifications,
      gender,
      languages
    } = req.body
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    const licenseFile = files?.licenseFile?.[0]
    const cvFile = files?.cvFile?.[0]
    
    // Parse languages if it's a string
    let parsedLanguages = languages
    if (typeof languages === 'string') {
      try {
        parsedLanguages = JSON.parse(languages)
      } catch (e) {
        parsedLanguages = []
      }
    }
    
    // Check if user already exists (by email or NIC)
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email },
          { nic }
        ]
      } 
    })
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'User with this email already exists' })
      }
      if (existingUser.nic === nic) {
        return res.status(400).json({ error: 'User with this NIC already exists' })
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with full name
    const fullName = `${firstName} ${lastName}`
    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      phone,
      nic,
      role: 'doctor'
    })

    // Import DoctorDetails here to avoid circular imports
    const { DoctorDetails } = await import('../models/DoctorDetails')
    
    // Create doctor details
    await DoctorDetails.create({
      userId: user.id,
      specialization,
      licenseNumber,
      experience: parseInt(experience) || 0,
      district,
      qualifications,
      gender,
      location: district, // Use district as location
      languages: parsedLanguages ? JSON.stringify(parsedLanguages) : undefined,
      approved: false, // Require admin approval
      licensePath: licenseFile?.filename,
      cvPath: cvFile?.filename
    })

    res.status(201).json({ 
      message: 'Doctor registered successfully, pending admin approval', 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err: any) {
    console.error('Doctor signup error:', err)
    res.status(500).json({ error: err.message || 'Registration failed' })
  }
}

export const doctorLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ 
      where: { email, role: 'doctor' },
      include: [{
        model: require('../models/DoctorDetails').DoctorDetails,
        as: 'DoctorDetail', // Add the correct alias
        required: true
      }]
    })
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    // Check if doctor is approved
    const doctorDetail = (user as any).DoctorDetail
    if (!doctorDetail || !doctorDetail.approved) {
      return res.status(403).json({ error: 'Your account is pending admin approval. Please wait for approval before logging in.' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, role: 'doctor' }, JWT_SECRET, { expiresIn: '1d' })
    res.json({ token, user })
  } catch (err) {
    console.error('Doctor login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
}

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email, role: 'admin' } })
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Unauthorized' })

    const token = jwt.sign({ id: user.id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' })
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('Fetching profile for user:', userId) // Debug log

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: DoctorDetails,
          required: false, // LEFT JOIN to include doctors without details
          as: 'DoctorDetail' // Make sure we use the same alias as in doctorLogin
        }
      ]
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    console.log('User found:', user.role) // Debug log
    console.log('User data:', JSON.stringify(user.toJSON(), null, 2)) // Debug log

    // For doctors, merge User data with DoctorDetails
    if (user.role === 'doctor') {
      const doctorDetails = (user as any).DoctorDetail
      console.log('Doctor details found:', doctorDetails ? 'Yes' : 'No') // Debug log
      console.log('Raw doctor details:', JSON.stringify(doctorDetails, null, 2)) // Debug log
      
      // Split the name into firstName and lastName
      const nameParts = user.name.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const doctorProfile = {
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        nicNumber: user.nic || '',
        specialization: doctorDetails?.specialization || '',
        licenseNumber: doctorDetails?.licenseNumber || '',
        experience: doctorDetails?.experience?.toString() || '', // Convert to string
        district: doctorDetails?.district || '',
        qualifications: doctorDetails?.qualifications || '',
        gender: doctorDetails?.gender || '',
        languages: doctorDetails?.languages ? JSON.parse(doctorDetails.languages) : []
      }
      
      console.log('Returning doctor profile:', JSON.stringify(doctorProfile, null, 2)) // Debug log
      return res.json(doctorProfile)
    } else {
      // For patients, split name and return patient data
      const nameParts = user.name.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const patientProfile = {
        firstName,
        lastName,
        email: user.email,
        phone: user.phone,
        emergencyContactName: '', // Add these fields to User model if needed
        emergencyContactPhone: '',
        gender: user.gender || 'male',
        birthDate: user.dob ? user.dob.toISOString().split('T')[0] : '',
        nicNumber: user.nic,
        bloodGroup: '', // Add these fields to User model if needed
        allergies: '',
        medicalHistory: '',
        district: '' // Remove reference to non-existent field
      }
      
      return res.json(patientProfile)
    }
  } catch (err: any) {
    console.error('Get profile error:', err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role === 'doctor') {
      const {
        firstName,
        lastName,
        email,
        phone,
        nicNumber,
        specialization,
        licenseNumber,
        experience,
        district,
        qualifications,
        gender,
        languages
      } = req.body

      // Update User table
      const userUpdateData: any = {}
      if (firstName && lastName) {
        userUpdateData.name = `${firstName} ${lastName}`
      }
      if (email) userUpdateData.email = email
      if (phone) userUpdateData.phone = phone
      if (nicNumber) userUpdateData.nic = nicNumber

      await user.update(userUpdateData)

      // Update or create DoctorDetails
      let doctorDetails = await DoctorDetails.findOne({ where: { userId } })
      
      const doctorUpdateData: any = {}
      if (specialization) doctorUpdateData.specialization = specialization
      if (licenseNumber) doctorUpdateData.licenseNumber = licenseNumber
      if (experience) doctorUpdateData.experience = parseInt(experience)
      if (district) doctorUpdateData.district = district
      if (qualifications) doctorUpdateData.qualifications = qualifications
      if (gender) doctorUpdateData.gender = gender
      if (languages) doctorUpdateData.languages = JSON.stringify(languages)

      if (doctorDetails) {
        await doctorDetails.update(doctorUpdateData)
      } else {
        await DoctorDetails.create({
          userId,
          specialization: specialization || '',
          ...doctorUpdateData
        })
      }
    } else {
      // Handle patient updates
      const {
        firstName,
        lastName,
        email,
        phone,
        gender,
        birthDate,
        nicNumber
      } = req.body

      const userUpdateData: any = {}
      if (firstName && lastName) {
        userUpdateData.name = `${firstName} ${lastName}`
      }
      if (email) userUpdateData.email = email
      if (phone) userUpdateData.phone = phone
      if (gender) userUpdateData.gender = gender
      if (birthDate) userUpdateData.dob = new Date(birthDate)
      if (nicNumber) userUpdateData.nic = nicNumber

      await user.update(userUpdateData)
    }

    // Fetch updated profile
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: user.role === 'doctor' ? [{ 
        model: DoctorDetails, 
        required: false,
        as: 'DoctorDetail' 
      }] : []
    })

    res.json({ message: 'Profile updated successfully', user: updatedUser })
  } catch (err: any) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { currentPassword, newPassword } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    
    // Update password
    await user.update({ password: hashedNewPassword })

    res.json({ message: 'Password changed successfully' })
  } catch (err: any) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Failed to change password' })
  }
}
