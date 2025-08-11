const { sequelize } = require('./dist/config/postgres.config');

async function dropPrescriptionsTable() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    console.log('Dropping prescriptions table...');
    await sequelize.query('DROP TABLE IF EXISTS "Prescriptions" CASCADE');
    
    console.log('✅ Prescriptions table dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping prescriptions table:', error);
    process.exit(1);
  }
}

dropPrescriptionsTable();
