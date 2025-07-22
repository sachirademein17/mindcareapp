"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Meeting_1 = require("../models/Meeting");
const Enrollment_1 = require("../models/Enrollment");
const sequelize_1 = require("sequelize");
const router = express_1.default.Router();
// Create meeting
router.post('/', async (req, res) => {
    try {
        const { enrollmentId, scheduledAt } = req.body;
        // Validate enrollment
        const enrollment = await Enrollment_1.Enrollment.findByPk(enrollmentId);
        if (!enrollment)
            return res.status(404).json({ message: 'Invalid enrollmentId' });
        const meetingUrl = `https://meet.jit.si/mentalhealth-${enrollmentId}-${Date.now()}`;
        const meeting = await Meeting_1.Meeting.create({ enrollmentId, scheduledAt, meetingUrl });
        res.status(201).json(meeting);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create meeting', error });
    }
});
// Get all meetings for a user (by doctorId or patientId)
router.get('/user/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const enrollments = await Enrollment_1.Enrollment.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { doctorId: userId },
                    { patientId: userId }
                ]
            }
        });
        const enrollmentIds = enrollments.map(e => e.id);
        const meetings = await Meeting_1.Meeting.findAll({
            where: { enrollmentId: enrollmentIds }
        });
        res.json(meetings);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch meetings', error });
    }
});
// Delete meeting
router.delete('/:id', async (req, res) => {
    try {
        const meeting = await Meeting_1.Meeting.findByPk(req.params.id);
        if (!meeting)
            return res.status(404).json({ message: 'Meeting not found' });
        await meeting.destroy();
        res.status(204).end();
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete meeting', error });
    }
});
exports.default = router;
