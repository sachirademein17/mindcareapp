// 📁 backend/src/models/Meeting.ts
import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

export interface MeetingAttributes {
  id: number
  patientId: number
  doctorId: number
  enrollmentId: number
  meetingDate: string // Format: YYYY-MM-DD
  startTime: string // Format: HH:00 (24-hour format, whole hours only)
  endTime: string // Format: HH:00 (will be startTime + 1 hour)
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled'
  patientNotes?: string
  doctorNotes?: string
  declineReason?: string
  meetingUrl?: string // Jitsi meeting URL
  consultationFee: number // Doctor's consultation fee for this meeting
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'withdrawn'
  paymentId?: string // Stripe payment ID
  paymentIntentId?: string // Stripe payment intent ID
  canRefund: boolean // Whether payment can still be refunded (within 1 day)
  refundDeadline?: Date // 1 day after booking
  rating?: number // Patient rating for doctor (1-5 stars)
  ratingComment?: string // Patient's rating comment
  requestedAt: Date
  approvedAt?: Date
  declinedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface MeetingCreationAttributes extends Optional<MeetingAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paymentStatus' | 'canRefund' | 'requestedAt'> {}

export class Meeting extends Model<MeetingAttributes, MeetingCreationAttributes> implements MeetingAttributes {
  public id!: number
  public patientId!: number
  public doctorId!: number
  public enrollmentId!: number
  public meetingDate!: string
  public startTime!: string
  public endTime!: string
  public status!: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled'
  public patientNotes?: string
  public doctorNotes?: string
  public declineReason?: string
  public meetingUrl?: string
  public consultationFee!: number
  public paymentStatus!: 'pending' | 'paid' | 'refunded' | 'withdrawn'
  public paymentId?: string
  public paymentIntentId?: string
  public canRefund!: boolean
  public refundDeadline?: Date
  public rating?: number
  public ratingComment?: string
  public requestedAt!: Date
  public approvedAt?: Date
  public declinedAt?: Date
  public completedAt?: Date
  public cancelledAt?: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Meeting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    enrollmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Enrollments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    },
    meetingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Format: YYYY-MM-DD',
    },
    startTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        is: /^([01]?\d|2[0-3]):00$/, // Only whole hours like 09:00, 13:00
      },
      comment: 'Format: HH:00 (24-hour format, whole hours only)',
    },
    endTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        is: /^([01]?\d|2[0-3]):00$/, // Only whole hours like 10:00, 14:00
      },
      comment: 'Format: HH:00 (will be startTime + 1 hour)',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'declined', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    patientNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doctorNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    declineReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meetingUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Jitsi meeting URL',
    },
    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Doctor consultation fee in USD',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded', 'withdrawn'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Stripe payment ID',
    },
    paymentIntentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Stripe payment intent ID',
    },
    canRefund: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether payment can still be refunded (within 1 day)',
    },
    refundDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '1 day after booking',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Patient rating for doctor (1-5 stars)',
    },
    ratingComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Patient rating comment',
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    declinedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelledAt: {
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
    tableName: 'Meetings',
    timestamps: true,
  }
)

export default Meeting
