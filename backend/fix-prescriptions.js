const { sequelize } = require('./dist/config/postgres.config');

async function fixPrescriptionsTable() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    console.log('Clearing prescriptions table...');
    await sequelize.query('DELETE FROM "Prescriptions"');
    
    console.log('Dropping prescriptions table...');
    await sequelize.query('DROP TABLE IF EXISTS "Prescriptions"');
    
    console.log('Table cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPrescriptionsTable();
