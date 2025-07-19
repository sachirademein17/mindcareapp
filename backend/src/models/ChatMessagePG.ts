// 📁 backend/src/models/ChatMessagePG.ts
import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

interface ChatMessageAttributes {
  id: number
  senderId: number
  receiverId: number
  message: string
  timestamp: Date
  isRead: boolean
}

interface ChatMessageCreationAttributes extends Optional<ChatMessageAttributes, 'id' | 'timestamp' | 'isRead'> {}

class ChatMessagePG extends Model<ChatMessageAttributes, ChatMessageCreationAttributes> implements ChatMessageAttributes {
  public id!: number
  public senderId!: number
  public receiverId!: number
  public message!: string
  public timestamp!: Date
  public isRead!: boolean

  // Associations will be defined after User model is imported
  public readonly sender?: any
  public readonly receiver?: any

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

ChatMessagePG.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
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
  }
)

export { ChatMessagePG }
