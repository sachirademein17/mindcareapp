// 📁 backend/src/models/Enrollment.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

interface EnrollmentModel extends Model<InferAttributes<EnrollmentModel>, InferCreationAttributes<EnrollmentModel>> {
  id: CreationOptional<number>
  patientId: number
  doctorId: number
  status: CreationOptional<'pending' | 'approved' | 'rejected'>
}

export const Enrollment = sequelize.define<EnrollmentModel>('Enrollment', {
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
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
})
