// 📁 backend/src/models/DoctorAvailability.ts
import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

export interface DoctorAvailabilityAttributes {
  id: number
  doctorId: number
  dayOfWeek: number // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  startTime: string // Format: "HH:MM" (24-hour format, whole hours only like "09:00", "13:00")
  endTime: string // Format: "HH:MM" (24-hour format, whole hours only like "17:00", "20:00")
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface DoctorAvailabilityCreationAttributes extends Optional<DoctorAvailabilityAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class DoctorAvailability extends Model<DoctorAvailabilityAttributes, DoctorAvailabilityCreationAttributes> implements DoctorAvailabilityAttributes {
  public id!: number
  public doctorId!: number
  public dayOfWeek!: number
  public startTime!: string
  public endTime!: string
  public isActive!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

DoctorAvailability.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6,
      },
      comment: '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday',
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
        is: /^([01]?\d|2[0-3]):00$/, // Only whole hours like 17:00, 20:00
      },
      comment: 'Format: HH:00 (24-hour format, whole hours only)',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'DoctorAvailabilities',
    timestamps: true,
  }
)

export default DoctorAvailability
