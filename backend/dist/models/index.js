"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meeting = exports.Warning = exports.ChatMessagePG = exports.Enrollment = exports.DoctorDetails = exports.User = exports.initializeAllModels = void 0;
// 📁 backend/src/models/index.ts
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const DoctorDetails_1 = require("./DoctorDetails");
Object.defineProperty(exports, "DoctorDetails", { enumerable: true, get: function () { return DoctorDetails_1.DoctorDetails; } });
const Enrollment_1 = require("./Enrollment");
Object.defineProperty(exports, "Enrollment", { enumerable: true, get: function () { return Enrollment_1.Enrollment; } });
const ChatMessagePG_1 = require("./ChatMessagePG");
Object.defineProperty(exports, "ChatMessagePG", { enumerable: true, get: function () { return ChatMessagePG_1.ChatMessagePG; } });
const Warning_1 = require("./Warning");
Object.defineProperty(exports, "Warning", { enumerable: true, get: function () { return Warning_1.Warning; } });
const Meeting_1 = require("./Meeting");
Object.defineProperty(exports, "Meeting", { enumerable: true, get: function () { return Meeting_1.Meeting; } });
// Define relationships
User_1.User.hasOne(DoctorDetails_1.DoctorDetails, { foreignKey: 'userId', as: 'DoctorDetail' });
DoctorDetails_1.DoctorDetails.belongsTo(User_1.User, { foreignKey: 'userId' });
User_1.User.hasMany(Enrollment_1.Enrollment, { foreignKey: 'patientId', as: 'PatientEnrollments' });
User_1.User.hasMany(Enrollment_1.Enrollment, { foreignKey: 'doctorId', as: 'DoctorEnrollments' });
Enrollment_1.Enrollment.belongsTo(User_1.User, { foreignKey: 'patientId', as: 'Patient' });
Enrollment_1.Enrollment.belongsTo(User_1.User, { foreignKey: 'doctorId', as: 'Doctor' });
// Meeting relationships
Meeting_1.Meeting.belongsTo(User_1.User, { foreignKey: 'patientId', as: 'Patient' });
Meeting_1.Meeting.belongsTo(User_1.User, { foreignKey: 'doctorId', as: 'Doctor' });
Meeting_1.Meeting.belongsTo(Enrollment_1.Enrollment, { foreignKey: 'enrollmentId', as: 'Enrollment' });
User_1.User.hasMany(Meeting_1.Meeting, { foreignKey: 'patientId', as: 'PatientMeetings' });
User_1.User.hasMany(Meeting_1.Meeting, { foreignKey: 'doctorId', as: 'DoctorMeetings' });
Enrollment_1.Enrollment.hasMany(Meeting_1.Meeting, { foreignKey: 'enrollmentId', as: 'Meetings' });
// Chat message relationships
ChatMessagePG_1.ChatMessagePG.belongsTo(User_1.User, { foreignKey: 'senderId', as: 'sender' });
ChatMessagePG_1.ChatMessagePG.belongsTo(User_1.User, { foreignKey: 'receiverId', as: 'receiver' });
// Warning relationships
Warning_1.Warning.belongsTo(User_1.User, { foreignKey: 'reporterId', as: 'Reporter' });
Warning_1.Warning.belongsTo(User_1.User, { foreignKey: 'reportedUserId', as: 'ReportedUser' });
Warning_1.Warning.belongsTo(User_1.User, { foreignKey: 'adminId', as: 'Admin' });
User_1.User.hasMany(ChatMessagePG_1.ChatMessagePG, { foreignKey: 'senderId', as: 'sentMessages' });
User_1.User.hasMany(ChatMessagePG_1.ChatMessagePG, { foreignKey: 'receiverId', as: 'receivedMessages' });
// Initialize all models
const initializeAllModels = async () => {
    try {
        console.log('🔄 Initializing all models...');
        // Initialize User model first (it's referenced by others)
        await (0, User_1.initializeUserModel)();
        // Initialize other models
        await DoctorDetails_1.DoctorDetails.sync({ alter: true });
        console.log('✅ DoctorDetails model synced');
        await Enrollment_1.Enrollment.sync({ alter: true });
        console.log('✅ Enrollment model synced');
        await Meeting_1.Meeting.sync({ alter: true });
        console.log('✅ Meeting model synced');
        await ChatMessagePG_1.ChatMessagePG.sync({ alter: true });
        console.log('✅ ChatMessagePG model synced');
        await Warning_1.Warning.sync({ alter: true });
        console.log('✅ Warning model synced');
        console.log('✅ All models initialized successfully');
        console.log('📝 Note: ChatMessage now uses PostgreSQL with proper foreign keys');
    }
    catch (error) {
        console.error('❌ Error initializing models:', error);
    }
};
exports.initializeAllModels = initializeAllModels;
