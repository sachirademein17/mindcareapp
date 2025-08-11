// 📁 backend/src/models/Warning.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

interface WarningModel extends Model<InferAttributes<WarningModel>, InferCreationAttributes<WarningModel>> {
  id: CreationOptional<number>
  reporterId: number
  reporterType: 'patient' | 'doctor'
  reportedUserId: number
  reportedUserType: 'patient' | 'doctor'
  category: 'inappropriate_behavior' | 'harassment' | 'unprofessional_conduct' | 'spam' | 'other'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: CreationOptional<'pending' | 'under_review' | 'resolved' | 'dismissed'>
  adminNotes?: string
  adminId?: number
  createdAt: CreationOptional<Date>
  updatedAt: CreationOptional<Date>
}

export const Warning = sequelize.define<WarningModel>('Warning', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reporterType: {
    type: DataTypes.ENUM('patient', 'doctor'),
    allowNull: false
  },
  reportedUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reportedUserType: {
    type: DataTypes.ENUM('patient', 'doctor'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('inappropriate_behavior', 'harassment', 'unprofessional_conduct', 'spam', 'other'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'under_review', 'resolved', 'dismissed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Warnings',
  timestamps: true
})
