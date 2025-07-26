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
    patientId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true // Temporarily allow null for migration
    },
    patientNIC: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true // Temporarily allow null for migration
    },
    drugName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true // Temporarily allow null for migration
    },
    dosage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true // Temporarily allow null for migration
    },
    frequency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true // Temporarily allow null for migration
    },
    duration: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true // Temporarily allow null for migration
    },
    instructions: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true // Temporarily allow null for migration
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    }
});
