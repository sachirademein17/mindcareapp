"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessagePG = exports.Prescription = exports.Meeting = exports.Enrollment = exports.DoctorDetails = exports.User = exports.initializeAllModels = void 0;
// 📁 backend/src/models/index.ts
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const DoctorDetails_1 = require("./DoctorDetails");
Object.defineProperty(exports, "DoctorDetails", { enumerable: true, get: function () { return DoctorDetails_1.DoctorDetails; } });
const Enrollment_1 = require("./Enrollment");
Object.defineProperty(exports, "Enrollment", { enumerable: true, get: function () { return Enrollment_1.Enrollment; } });
const Meeting_1 = require("./Meeting");
Object.defineProperty(exports, "Meeting", { enumerable: true, get: function () { return Meeting_1.Meeting; } });
const Prescription_1 = require("./Prescription");
Object.defineProperty(exports, "Prescription", { enumerable: true, get: function () { return Prescription_1.Prescription; } });
const ChatMessagePG_1 = require("./ChatMessagePG");
Object.defineProperty(exports, "ChatMessagePG", { enumerable: true, get: function () { return ChatMessagePG_1.ChatMessagePG; } });
// Define relationships
User_1.User.hasOne(DoctorDetails_1.DoctorDetails, { foreignKey: 'userId' });
DoctorDetails_1.DoctorDetails.belongsTo(User_1.User, { foreignKey: 'userId' });
User_1.User.hasMany(Enrollment_1.Enrollment, { foreignKey: 'patientId', as: 'PatientEnrollments' });
User_1.User.hasMany(Enrollment_1.Enrollment, { foreignKey: 'doctorId', as: 'DoctorEnrollments' });
Enrollment_1.Enrollment.belongsTo(User_1.User, { foreignKey: 'patientId', as: 'Patient' });
Enrollment_1.Enrollment.belongsTo(User_1.User, { foreignKey: 'doctorId', as: 'Doctor' });
Enrollment_1.Enrollment.hasMany(Meeting_1.Meeting, { foreignKey: 'enrollmentId' });
Meeting_1.Meeting.belongsTo(Enrollment_1.Enrollment, { foreignKey: 'enrollmentId' });
Enrollment_1.Enrollment.hasMany(Prescription_1.Prescription, { foreignKey: 'enrollmentId' });
Prescription_1.Prescription.belongsTo(Enrollment_1.Enrollment, { foreignKey: 'enrollmentId' });
// Chat message relationships
ChatMessagePG_1.ChatMessagePG.belongsTo(User_1.User, { foreignKey: 'senderId', as: 'sender' });
ChatMessagePG_1.ChatMessagePG.belongsTo(User_1.User, { foreignKey: 'receiverId', as: 'receiver' });
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
        await Prescription_1.Prescription.sync({ alter: true });
        console.log('✅ Prescription model synced');
        await ChatMessagePG_1.ChatMessagePG.sync({ alter: true });
        console.log('✅ ChatMessagePG model synced');
        console.log('✅ All models initialized successfully');
        console.log('📝 Note: ChatMessage now uses PostgreSQL with proper foreign keys');
    }
    catch (error) {
        console.error('❌ Error initializing models:', error);
    }
};
exports.initializeAllModels = initializeAllModels;
