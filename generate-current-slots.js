// Generate time slots for current dates
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

const generateCurrentTimeSlots = async () => {
  try {
    console.log('📅 Generating time slots for current dates...');
    
    // Get today's date
    const today = new Date();
    console.log('Today:', today.toISOString().split('T')[0]);
    
    // Generate slots for the next 14 days
    const slots = [];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Doctor 3 is available on Monday (1) and Tuesday (2) based on DoctorAvailability
      if (dayOfWeek === 1 || dayOfWeek === 2) {
        console.log(`Generating slots for ${dateStr} (day ${dayOfWeek})`);
        
        // Generate slots from 9 AM to 5 PM (17:00)
        const timeSlots = [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '10:00', endTime: '11:00' },
          { startTime: '11:00', endTime: '12:00' },
          { startTime: '12:00', endTime: '13:00' },
          { startTime: '13:00', endTime: '14:00' },
          { startTime: '14:00', endTime: '15:00' },
          { startTime: '15:00', endTime: '16:00' },
          { startTime: '16:00', endTime: '17:00' }
        ];
        
        for (const slot of timeSlots) {
          slots.push({
            doctorId: 3,
            date: dateStr,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: false,
            meetingId: null
          });
        }
      }
    }
    
    console.log(`📊 Generated ${slots.length} time slots`);
    
    // Insert slots into database
    const insertQuery = `
      INSERT INTO "TimeSlots" ("doctorId", "date", "startTime", "endTime", "isBooked", "meetingId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT ("doctorId", "date", "startTime") DO NOTHING
    `;
    
    let insertedCount = 0;
    for (const slot of slots) {
      try {
        await sequelize.query(insertQuery, {
          bind: [slot.doctorId, slot.date, slot.startTime, slot.endTime, slot.isBooked, slot.meetingId]
        });
        insertedCount++;
      } catch (err) {
        // Ignore duplicate entries
        if (!err.message.includes('duplicate')) {
          console.error('Error inserting slot:', err.message);
        }
      }
    }
    
    console.log(`✅ Successfully inserted ${insertedCount} new time slots`);
    
    // Test the API for tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`🧪 Testing API for tomorrow (${tomorrowStr})...`);
    const [testResults] = await sequelize.query(`
      SELECT * FROM "TimeSlots" 
      WHERE "doctorId" = 3 
      AND "date" = '${tomorrowStr}'
      AND "isBooked" = false
      ORDER BY "startTime"
    `);
    
    console.log(`📋 Available slots for tomorrow:`, testResults.length);
    testResults.forEach(slot => {
      console.log(`   ${slot.startTime} - ${slot.endTime}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
};

generateCurrentTimeSlots();
