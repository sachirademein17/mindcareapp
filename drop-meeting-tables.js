// 📁 drop-meeting-tables.js
const { Sequelize } = require('sequelize')
require('dotenv').config({ path: './backend/.env' })

// Create PostgreSQL connection using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
)

async function dropMeetingTables() {
  try {
    console.log('🔗 Connecting to PostgreSQL...')
    await sequelize.authenticate()
    console.log('✅ Connected to PostgreSQL')

    // Drop tables in order (drop child tables first to avoid foreign key constraints)
    console.log('🗑️ Dropping meeting-related tables...')
    
    await sequelize.query('DROP TABLE IF EXISTS "TimeSlots" CASCADE;')
    console.log('✅ TimeSlots table dropped')
    
    await sequelize.query('DROP TABLE IF EXISTS "Meetings" CASCADE;')
    console.log('✅ Meetings table dropped')
    
    await sequelize.query('DROP TABLE IF EXISTS "DoctorAvailabilities" CASCADE;')
    console.log('✅ DoctorAvailabilities table dropped')
    
    console.log('✅ All meeting-related tables dropped successfully!')
    
  } catch (error) {
    console.error('❌ Error dropping tables:', error)
  } finally {
    await sequelize.close()
  }
}

dropMeetingTables()
