// Check existing users in database
const { Pool } = require('pg');

async function checkUsers() {
  const client = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'mental_health_db',
    user: 'mental_health_user',
    password: 'your_secure_password'
  });

  try {
    console.log('🔍 Checking users in database...\n');
    
    // Get all users with their roles
    const usersResult = await client.query(`
      SELECT id, name, email, role, "isActive", "createdAt" 
      FROM "Users" 
      ORDER BY role, name
    `);
    
    console.log('👥 Found users:');
    console.table(usersResult.rows);
    
    // Check patient meetings data
    console.log('\n📋 Checking meetings for patients...');
    const meetingsResult = await client.query(`
      SELECT 
        m.id,
        m."patientId",
        m."doctorId", 
        m."meetingDate",
        m."startTime",
        m.status,
        p.name as patient_name,
        d.name as doctor_name
      FROM "Meetings" m
      LEFT JOIN "Users" p ON m."patientId" = p.id
      LEFT JOIN "Users" d ON m."doctorId" = d.id
      ORDER BY m."meetingDate" DESC, m."startTime" DESC
      LIMIT 10
    `);
    
    console.log('\n📅 Recent meetings:');
    console.table(meetingsResult.rows);
    
    if (meetingsResult.rows.length === 0) {
      console.log('⚠️  No meetings found in database');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();
