const { sequelize } = require('./src/config/postgres.config');

async function dropConsultationFeeColumn() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    await sequelize.query('ALTER TABLE "DoctorDetails" DROP COLUMN IF EXISTS "consultationFee";');
    console.log('✅ consultationFee column dropped successfully');
    
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('❌ Error dropping column:', error);
  }
}

dropConsultationFeeColumn();
