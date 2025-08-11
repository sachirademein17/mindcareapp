// 📁 backend/src/scripts/fixMeetingTable.js
const { Sequelize } = require('sequelize')

// PostgreSQL connection
const sequelize = new Sequelize('mental_health_db', 'postgres', 'Sachi123!', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: console.log
})

async function fixMeetingTable() {
  try {
    console.log('🔄 Connecting to PostgreSQL...')
    await sequelize.authenticate()
    console.log('✅ Connected to database')

    // Drop the existing Meetings table if it exists
    console.log('🗑️ Dropping old Meetings table...')
    await sequelize.query('DROP TABLE IF EXISTS "Meetings" CASCADE;')
    console.log('✅ Old Meetings table dropped')

    console.log('✅ Meeting table fix completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error fixing meeting table:', error)
    process.exit(1)
  }
}

fixMeetingTable()
