// 📁 backend/src/models/Prescription.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

interface PrescriptionModel extends Model<InferAttributes<PrescriptionModel>, InferCreationAttributes<PrescriptionModel>> {
  id: CreationOptional<number>
  enrollmentId: number
  patientId: number
  patientNIC: string
  drugName: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
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
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: true // Temporarily allow null for migration
  },
  patientNIC: {
    type: DataTypes.STRING,
    allowNull: true // Temporarily allow null for migration
  },
  drugName: {
    type: DataTypes.STRING,
    allowNull: true // Temporarily allow null for migration
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: true // Temporarily allow null for migration
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: true // Temporarily allow null for migration
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true // Temporarily allow null for migration
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true // Temporarily allow null for migration
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
})
