import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret'

export const patientSignup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, nic, gender, dob, phone } = req.body
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
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
    const { fullName, email, password, nic, specialization, gender, location, languages } = req.body
    const cvFile = req.file
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }
    
    if (!cvFile) {
      return res.status(400).json({ error: 'CV file is required' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      nic,
      role: 'doctor'
    })

    // Import DoctorDetails here to avoid circular imports
    const { DoctorDetails } = await import('../models/DoctorDetails')
    
    // Create doctor details
    await DoctorDetails.create({
      userId: user.id,
      specialization,
      gender,
      location,
      languages: typeof languages === 'string' ? languages : JSON.stringify(languages),
      approved: false,
      cvPath: cvFile.filename
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
        required: true
      }]
    })
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    // Check if doctor is approved
    const doctorDetail = (user as any).DoctorDetail
    if (!doctorDetail || !doctorDetail.approved) {
      return res.status(403).json({ error: 'Doctor not approved yet' })
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
