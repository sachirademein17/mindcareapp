// 📁 backend/src/models/index.ts
import { User, initializeUserModel } from './User'
import { DoctorDetails } from './DoctorDetails'
import { Enrollment } from './Enrollment'
import { Meeting } from './Meeting'
import { Prescription } from './Prescription'
import { ChatMessagePG } from './ChatMessagePG'

// Define relationships
User.hasOne(DoctorDetails, { foreignKey: 'userId', as: 'DoctorDetail' })
DoctorDetails.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Enrollment, { foreignKey: 'patientId', as: 'PatientEnrollments' })
User.hasMany(Enrollment, { foreignKey: 'doctorId', as: 'DoctorEnrollments' })
Enrollment.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' })
Enrollment.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' })

Enrollment.hasMany(Meeting, { foreignKey: 'enrollmentId' })
Meeting.belongsTo(Enrollment, { foreignKey: 'enrollmentId' })

Enrollment.hasMany(Prescription, { foreignKey: 'enrollmentId' })
Prescription.belongsTo(Enrollment, { foreignKey: 'enrollmentId' })

// Chat message relationships
ChatMessagePG.belongsTo(User, { foreignKey: 'senderId', as: 'sender' })
ChatMessagePG.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' })
User.hasMany(ChatMessagePG, { foreignKey: 'senderId', as: 'sentMessages' })
User.hasMany(ChatMessagePG, { foreignKey: 'receiverId', as: 'receivedMessages' })

// Initialize all models
export const initializeAllModels = async () => {
  try {
    console.log('🔄 Initializing all models...')
    
    // Initialize User model first (it's referenced by others)
    await initializeUserModel()
    
    // Initialize other models
    await DoctorDetails.sync({ alter: true })
    console.log('✅ DoctorDetails model synced')
    
    await Enrollment.sync({ alter: true })
    console.log('✅ Enrollment model synced')
    
    await Meeting.sync({ alter: true })
    console.log('✅ Meeting model synced')
    
    await Prescription.sync({ alter: true })
    console.log('✅ Prescription model synced')
    
    await ChatMessagePG.sync({ alter: true })
    console.log('✅ ChatMessagePG model synced')
    
    console.log('✅ All models initialized successfully')
    console.log('📝 Note: ChatMessage now uses PostgreSQL with proper foreign keys')
  } catch (error) {
    console.error('❌ Error initializing models:', error)
  }
}

export {
  User,
  DoctorDetails,
  Enrollment,
  Meeting,
  Prescription,
  ChatMessagePG
}
