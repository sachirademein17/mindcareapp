// 📁 backend/src/models/Payment.ts
import { DataTypes, Model, Optional, Op } from 'sequelize'
import { sequelize } from '../config/postgres.config'

export interface PaymentAttributes {
  id: number
  meetingId: number
  patientId: number
  doctorId: number
  amount: number // Payment amount in USD
  currency: string // USD
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  paymentMethod: 'stripe' | 'paypal' | 'card'
  
  // Stripe Integration
  stripePaymentIntentId?: string
  stripeChargeId?: string
  stripeRefundId?: string
  stripeCustomerId?: string
  
  // Payment Details
  paymentDate?: Date
  refundDate?: Date
  refundAmount?: number
  refundReason?: string
  
  // Processing Info
  processingFee: number // Platform fee (e.g., 5% of amount)
  doctorEarnings: number // Amount doctor receives after fees
  
  // Metadata
  metadata?: string // JSON string for additional data
  failureReason?: string
  
  createdAt: Date
  updatedAt: Date
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'currency' | 'processingFee' | 'doctorEarnings'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: number
  public meetingId!: number
  public patientId!: number
  public doctorId!: number
  public amount!: number
  public currency!: string
  public status!: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  public paymentMethod!: 'stripe' | 'paypal' | 'card'
  
  public stripePaymentIntentId?: string
  public stripeChargeId?: string
  public stripeRefundId?: string
  public stripeCustomerId?: string
  
  public paymentDate?: Date
  public refundDate?: Date
  public refundAmount?: number
  public refundReason?: string
  
  public processingFee!: number
  public doctorEarnings!: number
  
  public metadata?: string
  public failureReason?: string
  
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
      comment: 'Payment amount in USD',
      validate: {
        min: 0.01,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.ENUM('stripe', 'paypal', 'card'),
      allowNull: false,
      defaultValue: 'stripe',
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    stripeChargeId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeRefundId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    refundReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processingFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Platform processing fee',
    },
    doctorEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Amount doctor receives after fees',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string for additional payment data',
    },
    failureReason: {
      type: DataTypes.TEXT,
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
    tableName: 'Payments',
    timestamps: true,
    indexes: [
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
      {
        fields: ['stripePaymentIntentId'],
        unique: true,
        where: {
          stripePaymentIntentId: {
            [Op.ne]: null,
          },
        },
      },
    ],
  }
)

export default Payment
