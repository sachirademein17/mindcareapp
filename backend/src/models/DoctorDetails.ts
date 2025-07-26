// 📁 backend/src/models/DoctorDetails.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

interface DoctorDetailsModel extends Model<InferAttributes<DoctorDetailsModel>, InferCreationAttributes<DoctorDetailsModel>> {
  id: CreationOptional<number>
  userId: number
  specialization: string
  licenseNumber?: string
  experience?: number
  district?: string
  qualifications?: string
  gender?: string
  location?: string
  languages?: string // JSON string array
  approved: CreationOptional<boolean>
  cvPath?: string
  licensePath?: string
  bio?: string
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
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qualifications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true // Allow null temporarily for existing records
  },
  languages: {
    type: DataTypes.TEXT, // Changed to TEXT to store JSON string
    allowNull: true
  },
  approved: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  cvPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  licensePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
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
