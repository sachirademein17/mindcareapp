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
exports.adminLogin = exports.doctorLogin = exports.doctorSignup = exports.patientLogin = exports.patientSignup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret';
const patientSignup = async (req, res) => {
    try {
        const { name, email, password, nic, gender, dob, phone } = req.body;
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
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
        const { fullName, email, password, nic, specialization, gender, location, languages } = req.body;
        const cvFile = req.file;
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        if (!cvFile) {
            return res.status(400).json({ error: 'CV file is required' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user
        const user = await User_1.User.create({
            name: fullName,
            email,
            password: hashedPassword,
            nic,
            role: 'doctor'
        });
        // Import DoctorDetails here to avoid circular imports
        const { DoctorDetails } = await Promise.resolve().then(() => __importStar(require('../models/DoctorDetails')));
        // Create doctor details
        await DoctorDetails.create({
            userId: user.id,
            specialization,
            gender,
            location,
            languages: typeof languages === 'string' ? languages : JSON.stringify(languages),
            approved: false,
            cvPath: cvFile.filename
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
                    required: true
                }]
        });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });
        // Check if doctor is approved
        const doctorDetail = user.DoctorDetail;
        if (!doctorDetail || !doctorDetail.approved) {
            return res.status(403).json({ error: 'Doctor not approved yet' });
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
