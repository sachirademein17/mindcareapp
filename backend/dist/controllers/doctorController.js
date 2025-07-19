"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectEnrollment = exports.approveEnrollment = exports.getPendingEnrollments = exports.issuePrescription = exports.getEnrolledPatients = void 0;
const User_1 = require("../models/User");
const Enrollment_1 = require("../models/Enrollment");
const Prescription_1 = require("../models/Prescription");
const getEnrolledPatients = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const doctorId = req.user.id;
        const enrollments = await Enrollment_1.Enrollment.findAll({
            where: { doctorId, status: 'approved' },
            include: [
                { model: User_1.User, as: 'Patient', attributes: ['id', 'name', 'email'] }
            ]
        });
        res.json(enrollments);
    }
    catch (error) {
        console.error('Error fetching enrolled patients:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};
exports.getEnrolledPatients = getEnrolledPatients;
const issuePrescription = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { enrollmentId, notes } = req.body;
        const prescription = await Prescription_1.Prescription.create({ enrollmentId, notes });
        res.status(201).json(prescription);
    }
    catch (error) {
        console.error('Error issuing prescription:', error);
        res.status(500).json({ error: 'Failed to issue prescription' });
    }
};
exports.issuePrescription = issuePrescription;
const getPendingEnrollments = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const doctorId = req.user.id;
        const pendingEnrollments = await Enrollment_1.Enrollment.findAll({
            where: { doctorId, status: 'pending' },
            include: [
                { model: User_1.User, as: 'Patient', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(pendingEnrollments);
    }
    catch (error) {
        console.error('Error fetching pending enrollments:', error);
        res.status(500).json({ error: 'Failed to fetch pending enrollments' });
    }
};
exports.getPendingEnrollments = getPendingEnrollments;
const approveEnrollment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const doctorId = req.user.id;
        const enrollmentId = parseInt(req.params.enrollmentId);
        if (isNaN(enrollmentId)) {
            return res.status(400).json({ error: 'Invalid enrollment ID' });
        }
        const enrollment = await Enrollment_1.Enrollment.findOne({
            where: { id: enrollmentId, doctorId, status: 'pending' }
        });
        if (!enrollment) {
            return res.status(404).json({ error: 'Pending enrollment not found' });
        }
        await enrollment.update({ status: 'approved' });
        res.json({ message: 'Enrollment approved successfully', enrollment });
    }
    catch (error) {
        console.error('Error approving enrollment:', error);
        res.status(500).json({ error: 'Failed to approve enrollment' });
    }
};
exports.approveEnrollment = approveEnrollment;
const rejectEnrollment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const doctorId = req.user.id;
        const enrollmentId = parseInt(req.params.enrollmentId);
        if (isNaN(enrollmentId)) {
            return res.status(400).json({ error: 'Invalid enrollment ID' });
        }
        const enrollment = await Enrollment_1.Enrollment.findOne({
            where: { id: enrollmentId, doctorId, status: 'pending' }
        });
        if (!enrollment) {
            return res.status(404).json({ error: 'Pending enrollment not found' });
        }
        await enrollment.update({ status: 'rejected' });
        res.json({ message: 'Enrollment rejected successfully', enrollment });
    }
    catch (error) {
        console.error('Error rejecting enrollment:', error);
        res.status(500).json({ error: 'Failed to reject enrollment' });
    }
};
exports.rejectEnrollment = rejectEnrollment;
