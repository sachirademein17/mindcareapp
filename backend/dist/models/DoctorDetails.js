"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDoctorDetailsModel = exports.DoctorDetails = void 0;
// 📁 backend/src/models/DoctorDetails.ts
const sequelize_1 = require("sequelize");
const postgres_config_1 = require("../config/postgres.config");
exports.DoctorDetails = postgres_config_1.sequelize.define('DoctorDetails', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    specialization: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    licenseNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    experience: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    district: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    qualifications: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    gender: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true // Allow null temporarily for existing records
    },
    languages: {
        type: sequelize_1.DataTypes.TEXT, // Changed to TEXT to store JSON string
        allowNull: true
    },
    approved: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    cvPath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    licensePath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    }
});
const initializeDoctorDetailsModel = async () => {
    try {
        await exports.DoctorDetails.sync({ alter: true });
        console.log('✅ DoctorDetails model synced successfully');
    }
    catch (error) {
        console.error('❌ Error syncing DoctorDetails model:', error);
    }
};
exports.initializeDoctorDetailsModel = initializeDoctorDetailsModel;
