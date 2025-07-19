"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrescriptions = exports.cancelEnrollmentByDoctor = exports.getEnrollmentStatusByDoctor = exports.getEnrollmentStatus = exports.cancelEnrollment = exports.enrollDoctor = exports.filterDoctors = exports.getAllEnrollments = exports.getEnrolledDoctors = void 0;
const User_1 = require("../models/User");
const Enrollment_1 = require("../models/Enrollment");
const DoctorDetails_1 = require("../models/DoctorDetails");
const Prescription_1 = require("../models/Prescription");
const sequelize_1 = require("sequelize");
const getEnrolledDoctors = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const patientId = parseInt(req.user.id);
        if (isNaN(patientId)) {
            return res.status(400).json({ error: 'Invalid patient ID' });
        }
        const enrollments = await Enrollment_1.Enrollment.findAll({
            where: { patientId, status: 'approved' },
            include: [{ model: User_1.User, as: 'Doctor', attributes: ['id', 'name', 'email'] }]
        });
        res.json(enrollments);
    }
    catch (error) {
        console.error('Error fetching enrolled doctors:', error);
        res.status(500).json({ error: 'Failed to fetch enrolled doctors' });
    }
};
exports.getEnrolledDoctors = getEnrolledDoctors;
const getAllEnrollments = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const patientId = parseInt(req.user.id);
        if (isNaN(patientId)) {
            return res.status(400).json({ error: 'Invalid patient ID' });
        }
        const enrollments = await Enrollment_1.Enrollment.findAll({
            where: { patientId },
            include: [{ model: User_1.User, as: 'Doctor', attributes: ['id', 'name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(enrollments);
    }
    catch (error) {
        console.error('Error fetching all enrollments:', error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};
exports.getAllEnrollments = getAllEnrollments;
const filterDoctors = async (req, res) => {
    const { location, language } = req.query;
    try {
        const whereCondition = {
            approved: true
        };
        // Add location filter if provided
        if (location && typeof location === 'string' && location.trim() !== '') {
            whereCondition.location = { [sequelize_1.Op.iLike]: `%${location}%` };
        }
        // Add language filter if provided
        if (language && typeof language === 'string' && language.trim() !== '') {
            whereCondition.languages = { [sequelize_1.Op.iLike]: `%${language}%` };
        }
        const doctors = await User_1.User.findAll({
            where: { role: 'doctor' },
            include: [{
                    model: DoctorDetails_1.DoctorDetails,
                    required: true,
                    where: whereCondition
                }],
            attributes: ['id', 'name', 'email']
        });
        res.json(doctors);
    }
    catch (error) {
        console.error('Error filtering doctors:', error);
        res.status(500).json({ error: 'Failed to filter doctors' });
    }
};
exports.filterDoctors = filterDoctors;
const enrollDoctor = async (req, res) => {
    try {
        if (!req.user) {
            console.log('Enrollment failed: User not authenticated');
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const patientId = parseInt(req.user.id);
        const doctorId = parseInt(req.params.doctorId);
        console.log('Enrollment attempt:', { patientId, doctorId, userRole: req.user.role });
        if (isNaN(doctorId) || isNaN(patientId)) {
            console.log('Enrollment failed: Invalid IDs', { doctorId, patientId });
            return res.status(400).json({ error: 'Invalid IDs provided' });
        }
        // Check if doctor exists and is approved
        const doctor = await User_1.User.findOne({
            where: { id: doctorId, role: 'doctor' },
            include: [{ model: DoctorDetails_1.DoctorDetails, where: { approved: true } }]
        });
        if (!doctor) {
            console.log('Enrollment failed: Doctor not found or not approved', { doctorId });
            return res.status(404).json({ error: 'Doctor not found or not approved' });
        }
        const existing = await Enrollment_1.Enrollment.findOne({ where: { doctorId, patientId } });
        if (existing) {
            console.log('Enrollment failed: Already enrolled or pending', { doctorId, patientId, existingStatus: existing.status });
            return res.status(400).json({ error: 'Already enrolled or pending' });
        }
        const enrollment = await Enrollment_1.Enrollment.create({
            doctorId,
            patientId,
            status: 'pending'
        });
        console.log('Enrollment successful:', enrollment.toJSON());
        res.json({ message: 'Enrollment request sent', enrollment });
    }
    catch (error) {
        console.error('Error enrolling doctor:', error);
        res.status(500).json({ error: 'Enrollment failed' });
    }
};
exports.enrollDoctor = enrollDoctor;
const cancelEnrollment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const patientId = parseInt(req.user.id);
        const enrollmentId = parseInt(req.params.enrollmentId);
        if (isNaN(patientId) || isNaN(enrollmentId)) {
            return res.status(400).json({ error: 'Invalid IDs provided' });
        }
        const enrollment = await Enrollment_1.Enrollment.findOne({ where: { id: enrollmentId, patientId } });
        if (!enrollment)
            return res.status(404).json({ error: 'Enrollment not found' });
        await enrollment.destroy();
        res.json({ message: 'Enrollment cancelled successfully' });
    }
    catch (error) {
        console.error('Error cancelling enrollment:', error);
        res.status(500).json({ error: 'Failed to cancel enrollment' });
    }
};
exports.cancelEnrollment = cancelEnrollment;
const getEnrollmentStatus = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const patientId = parseInt(req.user.id);
        const enrollmentId = parseInt(req.params.enrollmentId);
        if (isNaN(patientId) || isNaN(enrollmentId)) {
            return res.status(400).json({ error: 'Invalid IDs provided' });
        }
        const enrollment = await Enrollment_1.Enrollment.findOne({
            where: { id: enrollmentId, patientId },
            include: [{ model: User_1.User, as: 'Doctor', attributes: ['id', 'name', 'email'] }]
        });
        if (!enrollment)
            return res.status(404).json({ error: 'Enrollment not found' });
        res.json(enrollment);
    }
    catch (error) {
        console.error('Error fetching enrollment status:', error);
        res.status(500).json({ error: 'Failed to fetch enrollment status' });
    }
};
exports.getEnrollmentStatus = getEnrollmentStatus;
const getEnrollmentStatusByDoctor = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const patientId = parseInt(req.user.id);
        const doctorId = parseInt(req.params.doctorId);
        if (isNaN(doctorId) || isNaN(patientId)) {
            return res.status(400).json({ error: 'Invalid IDs provided' });
        }
        const enrollment = await Enrollment_1.Enrollment.findOne({
            where: { doctorId, patientId }
        });
        if (!enrollment) {
            return res.status(404).json({ error: 'No enrollment found' });
        }
        res.json({ status: enrollment.status, enrollment });
    }
    catch (error) {
        console.error('Error checking enrollment status:', error);
        res.status(500).json({ error: 'Failed to check enrollment status' });
    }
};
exports.getEnrollmentStatusByDoctor = getEnrollmentStatusByDoctor;
const cancelEnrollmentByDoctor = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const patientId = parseInt(req.user.id);
        const doctorId = parseInt(req.params.doctorId);
        if (isNaN(doctorId) || isNaN(patientId)) {
            return res.status(400).json({ error: 'Invalid IDs provided' });
        }
        const enrollment = await Enrollment_1.Enrollment.findOne({
            where: { doctorId, patientId, status: 'pending' }
        });
        if (!enrollment) {
            return res.status(404).json({ error: 'No pending enrollment found with this doctor' });
        }
        await enrollment.destroy();
        res.json({ message: 'Enrollment request cancelled successfully' });
    }
    catch (error) {
        console.error('Error cancelling enrollment:', error);
        res.status(500).json({ error: 'Failed to cancel enrollment' });
    }
};
exports.cancelEnrollmentByDoctor = cancelEnrollmentByDoctor;
const getPrescriptions = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const patientId = parseInt(req.user.id);
        if (isNaN(patientId)) {
            return res.status(400).json({ error: 'Invalid patient ID' });
        }
        const prescriptions = await Prescription_1.Prescription.findAll({
            include: [{
                    model: Enrollment_1.Enrollment,
                    where: { patientId },
                    include: [{
                            model: User_1.User,
                            as: 'Doctor',
                            attributes: ['id', 'name', 'email']
                        }]
                }],
            order: [['createdAt', 'DESC']]
        });
        res.json(prescriptions);
    }
    catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
};
exports.getPrescriptions = getPrescriptions;
