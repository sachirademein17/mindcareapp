"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const DoctorDetails_1 = require("../models/DoctorDetails");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Middleware to require admin role
const requireAdmin = [auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)('admin')];
// GET all users
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await User_1.User.findAll({
            include: [{
                    model: DoctorDetails_1.DoctorDetails,
                    as: 'DoctorDetail', // Use the correct alias
                    required: false // LEFT JOIN to include users without doctor details
                }],
            attributes: { exclude: ['password'] } // Don't send passwords
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Approve doctor
router.put('/approve-doctor/:id', requireAdmin, async (req, res) => {
    try {
        const doctor = await DoctorDetails_1.DoctorDetails.findOne({ where: { userId: req.params.id } });
        if (!doctor)
            return res.status(404).json({ error: 'Doctor not found' });
        // Update both DoctorDetails and User approval status
        await doctor.update({ approved: true });
        await User_1.User.update({ isApproved: true }, { where: { id: req.params.id } });
        res.json({ message: 'Doctor approved successfully' });
    }
    catch (error) {
        console.error('Error approving doctor:', error);
        res.status(500).json({ error: 'Failed to approve doctor' });
    }
});
// Delete user
router.delete('/user/:id', requireAdmin, async (req, res) => {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
// Suspend user
router.post('/users/:id/suspend', requireAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const userId = req.params.id;
        if (!reason) {
            return res.status(400).json({ error: 'Suspension reason is required' });
        }
        const user = await User_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Check if user is already suspended
        if (user.isSuspended) {
            return res.status(400).json({ error: 'User is already suspended' });
        }
        // Update user suspension status
        await user.update({
            isSuspended: true,
            suspendedAt: new Date(),
            suspendReason: reason
        });
        console.log(`User ${userId} suspended by admin with reason: ${reason}`);
        res.json({
            message: 'User suspended successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isSuspended: user.isSuspended,
                suspendedAt: user.suspendedAt,
                suspendReason: user.suspendReason
            }
        });
    }
    catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ error: 'Failed to suspend user' });
    }
});
// Unsuspend user
router.post('/users/:id/unsuspend', requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Check if user is actually suspended
        if (!user.isSuspended) {
            return res.status(400).json({ error: 'User is not suspended' });
        }
        // Update user suspension status
        await user.update({
            isSuspended: false,
            suspendedAt: undefined,
            suspendReason: undefined
        });
        console.log(`User ${userId} unsuspended by admin`);
        res.json({
            message: 'User unsuspended successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isSuspended: user.isSuspended,
                suspendedAt: user.suspendedAt,
                suspendReason: user.suspendReason
            }
        });
    }
    catch (error) {
        console.error('Error unsuspending user:', error);
        res.status(500).json({ error: 'Failed to unsuspend user' });
    }
});
exports.default = router;
