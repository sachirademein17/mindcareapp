import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

// Define the User model interface
interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  id: CreationOptional<number>
  name: string
  email: string
  password: string
  nic: string
  role: 'patient' | 'doctor' | 'admin'
  gender?: string
  dob?: Date
  phone?: string
  isApproved: CreationOptional<boolean>
  isSuspended: CreationOptional<boolean>
  suspendedAt?: Date
  suspendReason?: string
}

export const User = sequelize.define<UserModel>('User', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  nic: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: { 
    type: DataTypes.ENUM('patient', 'doctor', 'admin'), 
    allowNull: false 
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isApproved: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  suspendedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  suspendReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
})

export const initializeUserModel = async () => {
  try {
    await User.sync({ alter: true }) // This will alter the table to match the model
    console.log('✅ User model synced successfully')
  } catch (error) {
    console.error('❌ Error syncing User model:', error)
  }
}