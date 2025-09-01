// 📁 backend/src/models/index.ts
import { User, initializeUserModel } from './User'
import { DoctorDetails } from './DoctorDetails'
import { Enrollment } from './Enrollment'
import { ChatMessagePG } from './ChatMessagePG'
import { Warning } from './Warning'
import DoctorAvailability from './DoctorAvailability'
import Meeting from './Meeting'
import Rating from './Rating'
import Payment from './Payment'
import Notification from './Notification'

// Define relationships
User.hasOne(DoctorDetails, { foreignKey: 'userId', as: 'DoctorDetail' })
DoctorDetails.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Enrollment, { foreignKey: 'patientId', as: 'PatientEnrollments' })
User.hasMany(Enrollment, { foreignKey: 'doctorId', as: 'DoctorEnrollments' })
Enrollment.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' })
Enrollment.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' })

// Chat message relationships
ChatMessagePG.belongsTo(User, { foreignKey: 'senderId', as: 'sender' })
ChatMessagePG.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' })

// Warning relationships
Warning.belongsTo(User, { foreignKey: 'reporterId', as: 'Reporter' })
Warning.belongsTo(User, { foreignKey: 'reportedUserId', as: 'ReportedUser' })
Warning.belongsTo(User, { foreignKey: 'adminId', as: 'Admin' })
User.hasMany(ChatMessagePG, { foreignKey: 'senderId', as: 'sentMessages' })
User.hasMany(ChatMessagePG, { foreignKey: 'receiverId', as: 'receivedMessages' })

// Meeting system relationships
User.hasMany(DoctorAvailability, { foreignKey: 'doctorId', as: 'Availabilities' })
DoctorAvailability.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' })

User.hasMany(Meeting, { foreignKey: 'patientId', as: 'PatientMeetings' })
User.hasMany(Meeting, { foreignKey: 'doctorId', as: 'DoctorMeetings' })
Meeting.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' })
Meeting.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' })
Meeting.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'Enrollment' })
Enrollment.hasMany(Meeting, { foreignKey: 'enrollmentId', as: 'Meetings' })

Meeting.hasOne(Rating, { foreignKey: 'meetingId', as: 'Rating' })
Rating.belongsTo(Meeting, { foreignKey: 'meetingId', as: 'Meeting' })
Rating.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' })
Rating.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' })
User.hasMany(Rating, { foreignKey: 'doctorId', as: 'ReceivedRatings' })
User.hasMany(Rating, { foreignKey: 'patientId', as: 'GivenRatings' })

// Payment system relationships
User.hasMany(Payment, { foreignKey: 'patientId', as: 'PatientPayments' })
User.hasMany(Payment, { foreignKey: 'doctorId', as: 'DoctorPayments' })
Payment.belongsTo(User, { foreignKey: 'patientId', as: 'Patient' })
Payment.belongsTo(User, { foreignKey: 'doctorId', as: 'Doctor' })
Payment.belongsTo(Meeting, { foreignKey: 'meetingId', as: 'Meeting' })
Meeting.hasOne(Payment, { foreignKey: 'meetingId', as: 'Payment' })

// Notification system relationships
User.hasMany(Notification, { foreignKey: 'userId', as: 'Notifications' })
Notification.belongsTo(User, { foreignKey: 'userId', as: 'User' })
Notification.belongsTo(Meeting, { foreignKey: 'meetingId', as: 'Meeting' })
Notification.belongsTo(Payment, { foreignKey: 'paymentId', as: 'Payment' })
Meeting.hasMany(Notification, { foreignKey: 'meetingId', as: 'Notifications' })
Payment.hasMany(Notification, { foreignKey: 'paymentId', as: 'Notifications' })

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
    
    await ChatMessagePG.sync({ alter: true })
    console.log('✅ ChatMessagePG model synced')
    
    await Warning.sync({ alter: true })
    console.log('✅ Warning model synced')
    
    await DoctorAvailability.sync({ alter: true })
    console.log('✅ DoctorAvailability model synced')
    
    await Meeting.sync({ alter: true })
    console.log('✅ Meeting model synced')
    
    await Rating.sync({ alter: true })
    console.log('✅ Rating model synced')
    
    await Payment.sync({ alter: true })
    console.log('✅ Payment model synced')
    
    await Notification.sync({ alter: true })
    console.log('✅ Notification model synced')
    
    console.log('✅ All models initialized successfully')
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
  DoctorAvailability,
  Meeting,
  Rating,
  Payment,
  Notification
}
