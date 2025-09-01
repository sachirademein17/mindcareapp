// 📁 backend/src/models/Notification.ts
import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

export interface NotificationAttributes {
  id: number
  userId: number // User receiving the notification
  title: string
  message: string
  type: 'payment' | 'refund' | 'meeting' | 'booking' | 'system' | 'reminder'
  status: 'unread' | 'read' | 'dismissed'
  
  // Related entities
  meetingId?: number
  paymentId?: number
  
  // Notification data
  data?: string // JSON string for additional data
  actionUrl?: string // URL for action button
  actionText?: string // Text for action button
  
  // Delivery
  isDelivered: boolean
  deliveredAt?: Date
  
  // Expiration
  expiresAt?: Date
  
  createdAt: Date
  updatedAt: Date
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isDelivered'> {}

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number
  public userId!: number
  public title!: string
  public message!: string
  public type!: 'payment' | 'refund' | 'meeting' | 'booking' | 'system' | 'reminder'
  public status!: 'unread' | 'read' | 'dismissed'
  
  public meetingId?: number
  public paymentId?: number
  
  public data?: string
  public actionUrl?: string
  public actionText?: string
  
  public isDelivered!: boolean
  public deliveredAt?: Date
  
  public expiresAt?: Date
  
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('payment', 'refund', 'meeting', 'booking', 'system', 'reminder'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('unread', 'read', 'dismissed'),
      allowNull: false,
      defaultValue: 'unread',
    },
    meetingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Meetings',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Payments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string for additional notification data',
    },
    actionUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    actionText: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isDelivered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'Notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['meetingId'],
      },
      {
        fields: ['paymentId'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
)

export default Notification
