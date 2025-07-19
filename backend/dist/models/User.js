"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeUserModel = exports.User = void 0;
const sequelize_1 = require("sequelize");
const postgres_config_1 = require("../config/postgres.config");
exports.User = postgres_config_1.sequelize.define('User', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    nic: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('patient', 'doctor', 'admin'),
        allowNull: false
    },
    gender: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    dob: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isApproved: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    }
});
const initializeUserModel = async () => {
    try {
        await exports.User.sync({ alter: true }); // This will alter the table to match the model
        console.log('✅ User model synced successfully');
    }
    catch (error) {
        console.error('❌ Error syncing User model:', error);
    }
};
exports.initializeUserModel = initializeUserModel;
