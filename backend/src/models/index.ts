// 📁 backend/src/models/index.ts
import { User, initializeUserModel } from './User'
import { DoctorDetails } from './DoctorDetails'
import { Enrollment } from './Enrollment'
import { ChatMessagePG } from './ChatMessagePG'
import { Warning } from './Warning'
import { Meeting } from './Meeting'

// Define relationships
User.hasOne(DoctorDetails, { foreignKey: 'userId', as: 'DoctorDetail' })
DoctorDetails.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Enrollment, { foreignKey: 'patientId', as: 'PatientEnrollments' })
User.hasMany(Enrollment, { foreignKey: 'doctorId', as: 'DoctorEnrollments' })
Enrollment.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' })
Enrollment.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' })

// Meeting relationships
Meeting.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' })
Meeting.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' })
Meeting.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'Enrollment' })
User.hasMany(Meeting, { foreignKey: 'patientId', as: 'PatientMeetings' })
User.hasMany(Meeting, { foreignKey: 'doctorId', as: 'DoctorMeetings' })
Enrollment.hasMany(Meeting, { foreignKey: 'enrollmentId', as: 'Meetings' })

// Chat message relationships
ChatMessagePG.belongsTo(User, { foreignKey: 'senderId', as: 'sender' })
ChatMessagePG.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' })

// Warning relationships
Warning.belongsTo(User, { foreignKey: 'reporterId', as: 'Reporter' })
Warning.belongsTo(User, { foreignKey: 'reportedUserId', as: 'ReportedUser' })
Warning.belongsTo(User, { foreignKey: 'adminId', as: 'Admin' })
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
    
    await ChatMessagePG.sync({ alter: true })
    console.log('✅ ChatMessagePG model synced')
    
    await Warning.sync({ alter: true })
    console.log('✅ Warning model synced')
    
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
  ChatMessagePG,
  Warning,
  Meeting
}
