"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrolledPatients = void 0;
const User_1 = require("../models/User");
const Enrollment_1 = require("../models/Enrollment");
const getEnrolledPatients = async (req, res) => {
    try {
        console.log('🔍 Doctor enrollments endpoint called');
        console.log('🔍 Request headers:', req.headers.authorization);
        console.log('🔍 Request user:', req.user);
        if (!req.user) {
            console.log('❌ No user in request');
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const doctorId = req.user.id;
        console.log('🔍 Doctor ID:', doctorId, 'Type:', typeof doctorId);
        const enrollments = await Enrollment_1.Enrollment.findAll({
            where: { doctorId, status: 'approved' },
            include: [
                { model: User_1.User, as: 'Patient', attributes: ['id', 'name', 'email', 'nic'] }
            ]
        });
        console.log('🔍 Found enrollments:', enrollments.length);
        res.json(enrollments);
    }
    catch (error) {
        console.error('❌ Error fetching enrolled patients:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};
exports.getEnrolledPatients = getEnrolledPatients;
