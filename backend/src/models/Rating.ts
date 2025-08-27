// 📁 backend/src/models/Rating.ts
import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/postgres.config'

export interface RatingAttributes {
  id: number
  meetingId: number
  patientId: number
  doctorId: number
  rating: number // 1-5 stars
  comment?: string
  communicationRating?: number // 1-5 for communication skills
  professionalismRating?: number // 1-5 for professionalism
  knowledgeRating?: number // 1-5 for medical knowledge
  overallSatisfaction?: number // 1-5 for overall satisfaction
  wouldRecommend?: boolean // Would recommend this doctor
  isAnonymous: boolean // Whether rating is anonymous
  isApproved: boolean // Whether rating is approved for public display
  moderationNotes?: string // Admin notes for moderation
  createdAt: Date
  updatedAt: Date
}

interface RatingCreationAttributes extends Optional<RatingAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isAnonymous' | 'isApproved'> {}

export class Rating extends Model<RatingAttributes, RatingCreationAttributes> implements RatingAttributes {
  public id!: number
  public meetingId!: number
  public patientId!: number
  public doctorId!: number
  public rating!: number
  public comment?: string
  public communicationRating?: number
  public professionalismRating?: number
  public knowledgeRating?: number
  public overallSatisfaction?: number
  public wouldRecommend?: boolean
  public isAnonymous!: boolean
  public isApproved!: boolean
  public moderationNotes?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Rating.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    meetingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // One rating per meeting
      references: {
        model: 'Meetings',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Overall rating 1-5 stars',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000], // Maximum 1000 characters
      },
    },
    communicationRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Communication skills rating 1-5',
    },
    professionalismRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Professionalism rating 1-5',
    },
    knowledgeRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Medical knowledge rating 1-5',
    },
    overallSatisfaction: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Overall satisfaction rating 1-5',
    },
    wouldRecommend: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Would recommend this doctor to others',
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether rating is anonymous',
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Auto-approve by default, can be moderated later
      comment: 'Whether rating is approved for public display',
    },
    moderationNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Admin notes for moderation',
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
    tableName: 'Ratings',
    timestamps: true,
    indexes: [
      {
        fields: ['doctorId'],
      },
      {
        fields: ['patientId'],
      },
      {
        fields: ['rating'],
      },
      {
        fields: ['isApproved'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
)

export default Rating
