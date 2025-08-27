// 📁 backend/src/models/Payment.ts
import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

export interface PaymentAttributes {
  id: number
  meetingId: number
  patientId: number
  doctorId: number
  amount: number
  currency: string
  stripePaymentId?: string
  stripePaymentIntentId: string
  stripeClientSecret?: string
  paymentMethod?: string // card, bank_transfer, etc.
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
  refundAmount?: number
  refundReason?: string
  refundedAt?: Date
  paymentFailureReason?: string
  metadata?: object // Additional payment data from Stripe
  createdAt: Date
  updatedAt: Date
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'currency' | 'status'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: number
  public meetingId!: number
  public patientId!: number
  public doctorId!: number
  public amount!: number
  public currency!: string
  public stripePaymentId?: string
  public stripePaymentIntentId!: string
  public stripeClientSecret?: string
  public paymentMethod?: string
  public status!: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
  public refundAmount?: number
  public refundReason?: string
  public refundedAt?: Date
  public paymentFailureReason?: string
  public metadata?: object
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    meetingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Meetings',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Payment amount in specified currency',
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
      comment: 'ISO currency code (USD, EUR, etc.)',
    },
    stripePaymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Stripe payment ID (pi_xxxxx)',
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Stripe payment intent ID',
    },
    stripeClientSecret: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Stripe client secret for frontend processing',
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Payment method type (card, bank_transfer, etc.)',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Amount refunded (can be partial)',
    },
    refundReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paymentFailureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional payment data from Stripe',
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
    tableName: 'Payments',
    timestamps: true,
    indexes: [
      {
        fields: ['stripePaymentId'],
        unique: true,
        where: {
          stripePaymentId: {
            [require('sequelize').Op.ne]: null
          }
        }
      },
      {
        fields: ['stripePaymentIntentId'],
        unique: true,
      },
      {
        fields: ['meetingId'],
      },
      {
        fields: ['patientId'],
      },
      {
        fields: ['doctorId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
)

export default Payment
