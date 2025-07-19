"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessagePG = void 0;
// 📁 backend/src/models/ChatMessagePG.ts
const sequelize_1 = require("sequelize");
const postgres_config_1 = require("../config/postgres.config");
class ChatMessagePG extends sequelize_1.Model {
}
exports.ChatMessagePG = ChatMessagePG;
ChatMessagePG.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    senderId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    receiverId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    isRead: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: postgres_config_1.sequelize,
    tableName: 'chat_messages',
    timestamps: true,
    indexes: [
        {
            fields: ['senderId', 'receiverId'],
        },
        {
            fields: ['timestamp'],
        },
    ],
});
