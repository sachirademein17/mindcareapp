"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.Payment = exports.Rating = exports.Meeting = exports.DoctorAvailability = exports.Warning = exports.ChatMessagePG = exports.Enrollment = exports.DoctorDetails = exports.User = exports.initializeAllModels = void 0;
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
const DoctorAvailability_1 = __importDefault(require("./DoctorAvailability"));
exports.DoctorAvailability = DoctorAvailability_1.default;
const Meeting_1 = __importDefault(require("./Meeting"));
exports.Meeting = Meeting_1.default;
const Rating_1 = __importDefault(require("./Rating"));
exports.Rating = Rating_1.default;
const Payment_1 = __importDefault(require("./Payment"));
exports.Payment = Payment_1.default;
const Notification_1 = __importDefault(require("./Notification"));
exports.Notification = Notification_1.default;
// Define relationships
User_1.User.hasOne(DoctorDetails_1.DoctorDetails, { foreignKey: 'userId', as: 'DoctorDetail' });
DoctorDetails_1.DoctorDetails.belongsTo(User_1.User, { foreignKey: 'userId' });
User_1.User.hasMany(Enrollment_1.Enrollment, { foreignKey: 'patientId', as: 'PatientEnrollments' });
User_1.User.hasMany(Enrollment_1.Enrollment, { foreignKey: 'doctorId', as: 'DoctorEnrollments' });
Enrollment_1.Enrollment.belongsTo(User_1.User, { foreignKey: 'patientId', as: 'Patient' });
Enrollment_1.Enrollment.belongsTo(User_1.User, { foreignKey: 'doctorId', as: 'Doctor' });
// Chat message relationships
ChatMessagePG_1.ChatMessagePG.belongsTo(User_1.User, { foreignKey: 'senderId', as: 'sender' });
ChatMessagePG_1.ChatMessagePG.belongsTo(User_1.User, { foreignKey: 'receiverId', as: 'receiver' });
// Warning relationships
Warning_1.Warning.belongsTo(User_1.User, { foreignKey: 'reporterId', as: 'Reporter' });
Warning_1.Warning.belongsTo(User_1.User, { foreignKey: 'reportedUserId', as: 'ReportedUser' });
Warning_1.Warning.belongsTo(User_1.User, { foreignKey: 'adminId', as: 'Admin' });
User_1.User.hasMany(ChatMessagePG_1.ChatMessagePG, { foreignKey: 'senderId', as: 'sentMessages' });
User_1.User.hasMany(ChatMessagePG_1.ChatMessagePG, { foreignKey: 'receiverId', as: 'receivedMessages' });
// Meeting system relationships
User_1.User.hasMany(DoctorAvailability_1.default, { foreignKey: 'doctorId', as: 'Availabilities' });
DoctorAvailability_1.default.belongsTo(User_1.User, { foreignKey: 'doctorId', as: 'Doctor' });
User_1.User.hasMany(Meeting_1.default, { foreignKey: 'patientId', as: 'PatientMeetings' });
User_1.User.hasMany(Meeting_1.default, { foreignKey: 'doctorId', as: 'DoctorMeetings' });
Meeting_1.default.belongsTo(User_1.User, { foreignKey: 'patientId', as: 'Patient' });
Meeting_1.default.belongsTo(User_1.User, { foreignKey: 'doctorId', as: 'Doctor' });
Meeting_1.default.belongsTo(Enrollment_1.Enrollment, { foreignKey: 'enrollmentId', as: 'Enrollment' });
Enrollment_1.Enrollment.hasMany(Meeting_1.default, { foreignKey: 'enrollmentId', as: 'Meetings' });
Meeting_1.default.hasOne(Rating_1.default, { foreignKey: 'meetingId', as: 'Rating' });
Rating_1.default.belongsTo(Meeting_1.default, { foreignKey: 'meetingId', as: 'Meeting' });
Rating_1.default.belongsTo(User_1.User, { foreignKey: 'patientId', as: 'Patient' });
Rating_1.default.belongsTo(User_1.User, { foreignKey: 'doctorId', as: 'Doctor' });
User_1.User.hasMany(Rating_1.default, { foreignKey: 'doctorId', as: 'ReceivedRatings' });
User_1.User.hasMany(Rating_1.default, { foreignKey: 'patientId', as: 'GivenRatings' });
// Payment system relationships
User_1.User.hasMany(Payment_1.default, { foreignKey: 'patientId', as: 'PatientPayments' });
User_1.User.hasMany(Payment_1.default, { foreignKey: 'doctorId', as: 'DoctorPayments' });
Payment_1.default.belongsTo(User_1.User, { foreignKey: 'patientId', as: 'Patient' });
Payment_1.default.belongsTo(User_1.User, { foreignKey: 'doctorId', as: 'Doctor' });
Payment_1.default.belongsTo(Meeting_1.default, { foreignKey: 'meetingId', as: 'Meeting' });
Meeting_1.default.hasOne(Payment_1.default, { foreignKey: 'meetingId', as: 'Payment' });
// Notification system relationships
User_1.User.hasMany(Notification_1.default, { foreignKey: 'userId', as: 'Notifications' });
Notification_1.default.belongsTo(User_1.User, { foreignKey: 'userId', as: 'User' });
Notification_1.default.belongsTo(Meeting_1.default, { foreignKey: 'meetingId', as: 'Meeting' });
Notification_1.default.belongsTo(Payment_1.default, { foreignKey: 'paymentId', as: 'Payment' });
Meeting_1.default.hasMany(Notification_1.default, { foreignKey: 'meetingId', as: 'Notifications' });
Payment_1.default.hasMany(Notification_1.default, { foreignKey: 'paymentId', as: 'Notifications' });
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
        await ChatMessagePG_1.ChatMessagePG.sync({ alter: true });
        console.log('✅ ChatMessagePG model synced');
        await Warning_1.Warning.sync({ alter: true });
        console.log('✅ Warning model synced');
        await DoctorAvailability_1.default.sync({ alter: true });
        console.log('✅ DoctorAvailability model synced');
        await Meeting_1.default.sync({ alter: true });
        console.log('✅ Meeting model synced');
        await Rating_1.default.sync({ alter: true });
        console.log('✅ Rating model synced');
        await Payment_1.default.sync({ alter: true });
        console.log('✅ Payment model synced');
        await Notification_1.default.sync({ alter: true });
        console.log('✅ Notification model synced');
        console.log('✅ All models initialized successfully');
    }
    catch (error) {
        console.error('❌ Error initializing models:', error);
    }
};
exports.initializeAllModels = initializeAllModels;
