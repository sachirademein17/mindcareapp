const { sequelize } = require('./src/config/postgres.config.ts')

async function updateLocations() {
  try {
    const result = await sequelize.query(
      'UPDATE "DoctorDetails" SET location = \'Colombo\' WHERE location IS NULL;'
    )
    console.log('Updated existing records:', result)
    process.exit(0)
  } catch (error) {
    console.error('Error updating records:', error)
    process.exit(1)
  }
}

updateLocations()
