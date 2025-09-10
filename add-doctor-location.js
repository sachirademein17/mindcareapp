const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './backend/.env' });

async function addDoctorLocation() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Update the test doctor with location in Colombo
    const [result] = await sequelize.query(`
      UPDATE "DoctorDetails" 
      SET 
        city = 'Colombo',
        address = '123 Galle Road, Colombo 03',
        location = 'Colombo',
        "updatedAt" = NOW()
      WHERE "userId" IN (
        SELECT id FROM "Users" WHERE email = 'testdoctor@mindcare.com' AND role = 'doctor'
      )
    `);

    console.log('✅ Updated doctor location to Colombo');

    // Let's also create some availability slots for today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    // Get the doctor's user ID
    const [doctorUser] = await sequelize.query(`
      SELECT id FROM "Users" WHERE email = 'testdoctor@mindcare.com' AND role = 'doctor'
    `);

    if (doctorUser.length > 0) {
      const doctorId = doctorUser[0].id;

      // Create availability slots
      const slots = [
        { date: formatDate(today), startTime: '09:00', endTime: '10:00' },
        { date: formatDate(today), startTime: '10:00', endTime: '11:00' },
        { date: formatDate(today), startTime: '14:00', endTime: '15:00' },
        { date: formatDate(tomorrow), startTime: '09:00', endTime: '10:00' },
        { date: formatDate(tomorrow), startTime: '11:00', endTime: '12:00' },
        { date: formatDate(tomorrow), startTime: '15:00', endTime: '16:00' }
      ];

      for (const slot of slots) {
        try {
          await sequelize.query(`
            INSERT INTO "DoctorAvailabilities" ("doctorId", date, "startTime", "endTime", "isBooked", "createdAt", "updatedAt")
            VALUES (?, ?, ?, ?, false, NOW(), NOW())
            ON CONFLICT ("doctorId", date, "startTime") DO NOTHING
          `, {
            replacements: [doctorId, slot.date, slot.startTime, slot.endTime]
          });
        } catch (error) {
          console.log(`Slot ${slot.date} ${slot.startTime} already exists or conflict`);
        }
      }

      console.log('✅ Created availability slots for today and tomorrow');

      // Create some sample ratings
      const sampleRatings = [
        { communication: 5, professionalism: 5, knowledge: 4, overallSatisfaction: 5, comment: 'Excellent doctor, very caring and professional!' },
        { communication: 4, professionalism: 5, knowledge: 5, overallSatisfaction: 4, comment: 'Very knowledgeable and helpful.' },
        { communication: 5, professionalism: 4, knowledge: 5, overallSatisfaction: 5, comment: 'Great experience, highly recommend!' }
      ];

      for (let i = 0; i < sampleRatings.length; i++) {
        try {
          await sequelize.query(`
            INSERT INTO "Ratings" ("doctorId", "userId", communication, professionalism, knowledge, "overallSatisfaction", comment, "createdAt", "updatedAt")
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, {
            replacements: [
              doctorId, 
              doctorId + i + 1, // Use different user IDs
              sampleRatings[i].communication,
              sampleRatings[i].professionalism,
              sampleRatings[i].knowledge,
              sampleRatings[i].overallSatisfaction,
              sampleRatings[i].comment
            ]
          });
        } catch (error) {
          console.log(`Rating ${i + 1} might already exist`);
        }
      }

      console.log('✅ Created sample ratings');
    }

    console.log('\n🎉 Doctor location and availability setup complete!');
    console.log('=====================================');
    console.log('📍 Location: Colombo, Sri Lanka');
    console.log('📅 Available slots created for today and tomorrow');
    console.log('⭐ Sample ratings added');
    console.log('=====================================');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addDoctorLocation();
