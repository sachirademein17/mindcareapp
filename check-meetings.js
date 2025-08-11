const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './backend/.env' });

async function checkMeetings() {
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

    const [meetings] = await sequelize.query(`
      SELECT 
        m.id,
        m."patientId",
        m."doctorId", 
        m.status,
        m."scheduledAt",
        m."requestedAt",
        p.name as patient_name,
        p.email as patient_email,
        d.name as doctor_name,
        d.email as doctor_email
      FROM "Meetings" m
      LEFT JOIN "Users" p ON m."patientId" = p.id
      LEFT JOIN "Users" d ON m."doctorId" = d.id
      ORDER BY m."requestedAt" DESC
      LIMIT 10
    `);

    console.log(`\n📅 Recent Meetings (${meetings.length} total):`);
    console.log('===============================================');
    
    if (meetings.length === 0) {
      console.log('No meetings found in database');
    } else {
      meetings.forEach(meeting => {
        console.log(`
📋 Meeting ID: ${meeting.id}
👤 Patient: ${meeting.patient_name} (${meeting.patient_email})
👨‍⚕️ Doctor: ${meeting.doctor_name} (${meeting.doctor_email})
📅 Scheduled: ${new Date(meeting.scheduledAt).toLocaleString()}
⏰ Requested: ${new Date(meeting.requestedAt).toLocaleString()}
🔄 Status: ${meeting.status}
-------------------`);
      });
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkMeetings();
