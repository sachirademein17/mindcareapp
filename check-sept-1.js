const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mental_health_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'dehiwalaZoo',
  logging: false
});

const checkDoctorAvailability = async () => {
  try {
    console.log('🔍 Checking doctor availability settings...');
    
    const [availability] = await sequelize.query('SELECT * FROM "DoctorAvailabilities" WHERE "doctorId" = 3');
    console.log('📅 Doctor Availability Settings:', JSON.stringify(availability, null, 2));
    
    const [timeSlots] = await sequelize.query('SELECT * FROM "TimeSlots" WHERE "doctorId" = 3 AND "date" = \'2025-09-01\' ORDER BY "startTime"');
    console.log('⏰ TimeSlots for Sept 1st:', JSON.stringify(timeSlots, null, 2));
    
    // Check day of week for Sept 1st
    const sept1 = new Date('2025-09-01');
    console.log('📆 September 1st, 2025 is day:', sept1.getDay(), '(0=Sunday, 1=Monday)');
    
    // Test the API directly
    console.log('🧪 Testing API call...');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
};

checkDoctorAvailability();
