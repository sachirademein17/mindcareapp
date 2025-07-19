"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meeting = void 0;
// 📁 backend/src/models/Meeting.ts
const sequelize_1 = require("sequelize");
const postgres_config_1 = require("../config/postgres.config");
exports.Meeting = postgres_config_1.sequelize.define('Meeting', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    meetingUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
});
