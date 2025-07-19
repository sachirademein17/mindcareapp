// 📁 backend/src/models/Meeting.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

interface MeetingModel extends Model<InferAttributes<MeetingModel>, InferCreationAttributes<MeetingModel>> {
  id: CreationOptional<number>
  enrollmentId: number
  scheduledAt: Date
  meetingUrl: string
}

export const Meeting = sequelize.define<MeetingModel>('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  meetingUrl: {
    type: DataTypes.STRING,
    allowNull: false
  }
})
