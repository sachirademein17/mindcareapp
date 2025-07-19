"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prescription = void 0;
// 📁 backend/src/models/Prescription.ts
const sequelize_1 = require("sequelize");
const postgres_config_1 = require("../config/postgres.config");
exports.Prescription = postgres_config_1.sequelize.define('Prescription', {
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
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    }
});
