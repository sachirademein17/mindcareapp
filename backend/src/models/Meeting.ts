import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/postgres.config'

export interface MeetingAttributes {
  id?: number
  patientId: number
  doctorId: number
  enrollmentId: number
  scheduledAt: Date
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  patientNotes?: string
  doctorNotes?: string
  rejectionReason?: string
  meetingUrl?: string
  duration: number // in minutes
  requestedAt: Date
  approvedAt?: Date
  cancelledAt?: Date
  completedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class Meeting extends Model<MeetingAttributes> implements MeetingAttributes {
  public id!: number
  public patientId!: number
  public doctorId!: number
  public enrollmentId!: number
  public scheduledAt!: Date
  public status!: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  public patientNotes?: string
  public doctorNotes?: string
  public rejectionReason?: string
  public meetingUrl?: string
  public duration!: number
  public requestedAt!: Date
  public approvedAt?: Date
  public cancelledAt?: Date
  public completedAt?: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Meeting.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  enrollmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Enrollments',
      key: 'id'
    }
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed'),
    defaultValue: 'pending',
    allowNull: false
  },
  patientNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  doctorNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  meetingUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    allowNull: false
  },
  requestedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Meeting',
  tableName: 'Meetings',
  timestamps: true
})
