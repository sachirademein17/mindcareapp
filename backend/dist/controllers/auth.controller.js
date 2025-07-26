"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.adminLogin = exports.doctorLogin = exports.doctorSignup = exports.patientLogin = exports.patientSignup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const User_1 = require("../models/User");
const DoctorDetails_1 = require("../models/DoctorDetails");
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret';
const patientSignup = async (req, res) => {
    try {
        console.log('Patient signup request:', req.body); // Debug log
        const { name, email, password, nic, gender, dob, phone } = req.body;
        // Check if user already exists (by email or NIC)
        const existingUser = await User_1.User.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { email },
                    { nic }
                ]
            }
        });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }
            if (existingUser.nic === nic) {
                return res.status(400).json({ error: 'User with this NIC already exists' });
            }
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await User_1.User.create({
            name,
            email,
            password: hashedPassword,
            nic,
            gender,
            dob: dob ? new Date(dob) : undefined,
            phone,
            role: 'patient'
        });
        console.log('Patient created successfully:', user.id); // Debug log
        res.status(201).json({ message: 'Patient registered successfully', user: { id: user.id, name: user.name, email: user.email } });
    }
    catch (err) {
        console.error('Patient signup error:', err);
        res.status(500).json({ error: err.message || 'Registration failed' });
    }
};
exports.patientSignup = patientSignup;
const patientLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ where: { email, role: 'patient' } });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: 'patient' }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user });
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
};
exports.patientLogin = patientLogin;
const doctorSignup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, nic, specialization, licenseNumber, experience, district, qualifications, gender, languages } = req.body;
        const files = req.files;
        const licenseFile = files?.licenseFile?.[0];
        const cvFile = files?.cvFile?.[0];
        // Parse languages if it's a string
        let parsedLanguages = languages;
        if (typeof languages === 'string') {
            try {
                parsedLanguages = JSON.parse(languages);
            }
            catch (e) {
                parsedLanguages = [];
            }
        }
        // Check if user already exists (by email or NIC)
        const existingUser = await User_1.User.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { email },
                    { nic }
                ]
            }
        });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }
            if (existingUser.nic === nic) {
                return res.status(400).json({ error: 'User with this NIC already exists' });
            }
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user with full name
        const fullName = `${firstName} ${lastName}`;
        const user = await User_1.User.create({
            name: fullName,
            email,
            password: hashedPassword,
            phone,
            nic,
            role: 'doctor'
        });
        // Import DoctorDetails here to avoid circular imports
        const { DoctorDetails } = await Promise.resolve().then(() => __importStar(require('../models/DoctorDetails')));
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
        });
        res.status(201).json({
            message: 'Doctor registered successfully, pending admin approval',
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    }
    catch (err) {
        console.error('Doctor signup error:', err);
        res.status(500).json({ error: err.message || 'Registration failed' });
    }
};
exports.doctorSignup = doctorSignup;
const doctorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({
            where: { email, role: 'doctor' },
            include: [{
                    model: require('../models/DoctorDetails').DoctorDetails,
                    as: 'DoctorDetail', // Add the correct alias
                    required: true
                }]
        });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });
        // Check if doctor is approved
        const doctorDetail = user.DoctorDetail;
        if (!doctorDetail || !doctorDetail.approved) {
            return res.status(403).json({ error: 'Your account is pending admin approval. Please wait for approval before logging in.' });
        }
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: 'doctor' }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user });
    }
    catch (err) {
        console.error('Doctor login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.doctorLogin = doctorLogin;
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ where: { email, role: 'admin' } });
        if (!user)
            return res.status(401).json({ error: 'Unauthorized' });
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: 'Unauthorized' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user });
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
};
exports.adminLogin = adminLogin;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log('Fetching profile for user:', userId); // Debug log
        const user = await User_1.User.findByPk(userId, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: DoctorDetails_1.DoctorDetails,
                    required: false, // LEFT JOIN to include doctors without details
                    as: 'DoctorDetail' // Make sure we use the same alias as in doctorLogin
                }
            ]
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('User found:', user.role); // Debug log
        console.log('User data:', JSON.stringify(user.toJSON(), null, 2)); // Debug log
        // For doctors, merge User data with DoctorDetails
        if (user.role === 'doctor') {
            const doctorDetails = user.DoctorDetail;
            console.log('Doctor details found:', doctorDetails ? 'Yes' : 'No'); // Debug log
            console.log('Raw doctor details:', JSON.stringify(doctorDetails, null, 2)); // Debug log
            // Split the name into firstName and lastName
            const nameParts = user.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
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
            };
            console.log('Returning doctor profile:', JSON.stringify(doctorProfile, null, 2)); // Debug log
            return res.json(doctorProfile);
        }
        else {
            // For patients, split name and return patient data
            const nameParts = user.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
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
            };
            return res.json(patientProfile);
        }
    }
    catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await User_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.role === 'doctor') {
            const { firstName, lastName, email, phone, nicNumber, specialization, licenseNumber, experience, district, qualifications, gender, languages } = req.body;
            // Update User table
            const userUpdateData = {};
            if (firstName && lastName) {
                userUpdateData.name = `${firstName} ${lastName}`;
            }
            if (email)
                userUpdateData.email = email;
            if (phone)
                userUpdateData.phone = phone;
            if (nicNumber)
                userUpdateData.nic = nicNumber;
            await user.update(userUpdateData);
            // Update or create DoctorDetails
            let doctorDetails = await DoctorDetails_1.DoctorDetails.findOne({ where: { userId } });
            const doctorUpdateData = {};
            if (specialization)
                doctorUpdateData.specialization = specialization;
            if (licenseNumber)
                doctorUpdateData.licenseNumber = licenseNumber;
            if (experience)
                doctorUpdateData.experience = parseInt(experience);
            if (district)
                doctorUpdateData.district = district;
            if (qualifications)
                doctorUpdateData.qualifications = qualifications;
            if (gender)
                doctorUpdateData.gender = gender;
            if (languages)
                doctorUpdateData.languages = JSON.stringify(languages);
            if (doctorDetails) {
                await doctorDetails.update(doctorUpdateData);
            }
            else {
                await DoctorDetails_1.DoctorDetails.create({
                    userId,
                    specialization: specialization || '',
                    ...doctorUpdateData
                });
            }
        }
        else {
            // Handle patient updates
            const { firstName, lastName, email, phone, gender, birthDate, nicNumber } = req.body;
            const userUpdateData = {};
            if (firstName && lastName) {
                userUpdateData.name = `${firstName} ${lastName}`;
            }
            if (email)
                userUpdateData.email = email;
            if (phone)
                userUpdateData.phone = phone;
            if (gender)
                userUpdateData.gender = gender;
            if (birthDate)
                userUpdateData.dob = new Date(birthDate);
            if (nicNumber)
                userUpdateData.nic = nicNumber;
            await user.update(userUpdateData);
        }
        // Fetch updated profile
        const updatedUser = await User_1.User.findByPk(userId, {
            attributes: { exclude: ['password'] },
            include: user.role === 'doctor' ? [{
                    model: DoctorDetails_1.DoctorDetails,
                    required: false,
                    as: 'DoctorDetail'
                }] : []
        });
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        const user = await User_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Verify current password
        const isCurrentPasswordValid = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        // Hash new password
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Update password
        await user.update({ password: hashedNewPassword });
        res.json({ message: 'Password changed successfully' });
    }
    catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Failed to change password' });
    }
};
exports.changePassword = changePassword;
