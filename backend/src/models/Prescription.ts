// 📁 backend/src/models/Prescription.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

interface PrescriptionModel extends Model<InferAttributes<PrescriptionModel>, InferCreationAttributes<PrescriptionModel>> {
  id: CreationOptional<number>
  enrollmentId: number
  notes: string
}

export const Prescription = sequelize.define<PrescriptionModel>('Prescription', {
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
  notes: {
    type: DataTypes.TEXT,
    allowNull: false
  }
})
