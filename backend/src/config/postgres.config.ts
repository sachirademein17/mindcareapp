import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mental_health_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  logging: false, // Set to console.log to see SQL queries
})

const connectPostgres = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ PostgreSQL connected successfully')
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error)
  }
}

export default connectPostgres
export { sequelize }
