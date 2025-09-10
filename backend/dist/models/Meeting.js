"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meeting = void 0;
// 📁 backend/src/models/Meeting.ts
const sequelize_1 = require("sequelize");
const postgres_config_1 = require("../config/postgres.config");
class Meeting extends sequelize_1.Model {
}
exports.Meeting = Meeting;
Meeting.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    patientId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
    },
    doctorId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
    },
    enrollmentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Enrollments',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
    },
    meetingDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Format: YYYY-MM-DD',
    },
    startTime: {
        type: sequelize_1.DataTypes.STRING(5),
        allowNull: false,
        validate: {
            is: /^([01]?\d|2[0-3]):00$/, // Only whole hours like 09:00, 13:00
        },
        comment: 'Format: HH:00 (24-hour format, whole hours only)',
    },
    endTime: {
        type: sequelize_1.DataTypes.STRING(5),
        allowNull: false,
        validate: {
            is: /^([01]?\d|2[0-3]):00$/, // Only whole hours like 10:00, 14:00
        },
        comment: 'Format: HH:00 (will be startTime + 1 hour)',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'declined', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    patientNotes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    doctorNotes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    declineReason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    meetingUrl: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        comment: 'Jitsi meeting URL',
    },
    consultationFee: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Doctor consultation fee in USD',
    },
    canRefund: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether cancellation is allowed (within 1 day)',
    },
    isPaid: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether patient has paid for this meeting',
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('unpaid', 'pending', 'paid', 'refunded', 'failed'),
        allowNull: false,
        defaultValue: 'unpaid',
    },
    paymentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Payments',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    stripePaymentIntentId: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        comment: 'Stripe payment intent ID',
    },
    stripeRefundId: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        comment: 'Stripe refund ID if refunded',
    },
    rating: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5,
        },
        comment: 'Patient rating for doctor (1-5 stars)',
    },
    ratingComment: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Patient rating comment',
    },
    refundAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Amount refunded to patient',
    },
    refundDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'When refund was processed',
    },
    refundReason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Why refund was given',
    },
    refundType: {
        type: sequelize_1.DataTypes.ENUM('full', 'partial', 'none'),
        allowNull: true,
    },
    refundProcessed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether refund has been processed',
    },
    requestedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    approvedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    declinedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    completedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    cancelledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: postgres_config_1.sequelize,
    tableName: 'Meetings',
    timestamps: true,
});
exports.default = Meeting;
