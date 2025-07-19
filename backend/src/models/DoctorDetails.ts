// 📁 backend/src/models/DoctorDetails.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

interface DoctorDetailsModel extends Model<InferAttributes<DoctorDetailsModel>, InferCreationAttributes<DoctorDetailsModel>> {
  id: CreationOptional<number>
  userId: number
  specialization: string
  gender: string
  location: string
  languages: string // JSON string array
  approved: CreationOptional<boolean>
  cvPath?: string
}

export const DoctorDetails = sequelize.define<DoctorDetailsModel>('DoctorDetails', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true // Allow null temporarily for existing records
  },
  languages: {
    type: DataTypes.TEXT, // Changed to TEXT to store JSON string
    allowNull: false
  },
  approved: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  cvPath: {
    type: DataTypes.STRING,
    allowNull: true
  }
})

export const initializeDoctorDetailsModel = async () => {
  try {
    await DoctorDetails.sync({ alter: true })
    console.log('✅ DoctorDetails model synced successfully')
  } catch (error) {
    console.error('❌ Error syncing DoctorDetails model:', error)
  }
}
