const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mental_health_db',
  user: 'postgres',
  password: 'dehiwalaZoo'
});

async function checkCurrentEnum() {
  try {
    console.log('🔍 Checking current enum values...');
    
    // Check current enum values
    const result = await pool.query(`
      SELECT unnest(enum_range(NULL::"public"."enum_Meetings_status")) AS status_values;
    `);
    
    console.log('📋 Current enum values in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.status_values}`);
    });
    
    // Test if we can insert payment_pending
    console.log('\n🧪 Testing payment_pending insertion...');
    try {
      await pool.query(`
        INSERT INTO "Meetings" (
          "patientId", "doctorId", "enrollmentId", "meetingDate", 
          "startTime", "endTime", "status", "consultationFee", 
          "requestedAt", "createdAt", "updatedAt"
        ) VALUES (
          1, 3, 2, '2025-12-01', '10:00', '11:00', 'payment_pending', 
          50.00, NOW(), NOW(), NOW()
        );
      `);
      console.log('✅ Successfully inserted meeting with payment_pending status');
      
      // Clean up test record
      await pool.query(`DELETE FROM "Meetings" WHERE "status" = 'payment_pending' AND "meetingDate" = '2025-12-01';`);
      console.log('🧹 Cleaned up test record');
      
    } catch (insertError) {
      console.error('❌ Failed to insert payment_pending:', insertError.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking enum:', error);
  } finally {
    await pool.end();
  }
}

checkCurrentEnum();
