import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

// PostgreSQL configuration - NO FALLBACK TO SQLITE
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mental_health_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'dehiwalaZoo',
  logging: console.log, // Enable logging to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false
  }
})

const connectPostgres = async () => {
  try {
    console.log('🔄 Connecting to PostgreSQL ONLY...')
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`)
    console.log(`   Port: ${process.env.DB_PORT || '5432'}`)
    console.log(`   Database: ${process.env.DB_NAME || 'mental_health_db'}`)
    console.log(`   User: ${process.env.DB_USER || 'postgres'}`)
    
    await sequelize.authenticate()
    console.log('✅ PostgreSQL connected successfully')
    return sequelize
  } catch (error: any) {
    console.error('❌ PostgreSQL connection failed:', error.message)
    console.error('💥 CRITICAL: Application requires PostgreSQL connection!')
    console.error('🔧 Please ensure PostgreSQL is running and credentials are correct.')
    throw new Error(`PostgreSQL connection failed: ${error.message}`)
  }
}

// Export both the connection function and sequelize instance
export default connectPostgres
export { sequelize }
