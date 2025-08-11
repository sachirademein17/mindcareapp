"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meeting = void 0;
const sequelize_1 = require("sequelize");
const postgres_config_1 = require("../config/postgres.config");
class Meeting extends sequelize_1.Model {
}
exports.Meeting = Meeting;
Meeting.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patientId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    doctorId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    enrollmentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Enrollments',
            key: 'id'
        }
    },
    scheduledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed'),
        defaultValue: 'pending',
        allowNull: false
    },
    patientNotes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    doctorNotes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    rejectionReason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    meetingUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    duration: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 60,
        allowNull: false
    },
    requestedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false
    },
    approvedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    cancelledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    completedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: postgres_config_1.sequelize,
    modelName: 'Meeting',
    tableName: 'Meetings',
    timestamps: true
});
