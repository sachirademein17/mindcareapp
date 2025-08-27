// Use direct connection
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

const checkTimeSlots = async () => {
  try {
    console.log('🔍 Checking TimeSlots for doctor ID 3...');
    
    // Check TimeSlots
    const [timeSlotsResults] = await sequelize.query(
      'SELECT * FROM "TimeSlots" WHERE "doctorId" = 3 LIMIT 10'
    );
    console.log('📋 TimeSlots for doctor 3:', JSON.stringify(timeSlotsResults, null, 2));
    
    // Check DoctorAvailability
    const [availabilityResults] = await sequelize.query(
      'SELECT * FROM "DoctorAvailabilities" WHERE "doctorId" = 3'
    );
    console.log('📅 DoctorAvailability for doctor 3:', JSON.stringify(availabilityResults, null, 2));
    
    // Check what's happening with today's date
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Today:', today);
    
    const [todaySlots] = await sequelize.query(`
      SELECT ts.*, da."dayOfWeek", da."isAvailable" 
      FROM "TimeSlots" ts 
      JOIN "DoctorAvailabilities" da ON ts."doctorId" = da."doctorId" 
      WHERE ts."doctorId" = 3 
      AND EXTRACT(DOW FROM DATE '${today}') = da."dayOfWeek"
      AND da."isAvailable" = true
      AND ts."isBooked" = false
    `);
    console.log('🎯 Available slots for today:', JSON.stringify(todaySlots, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
};

checkTimeSlots();
