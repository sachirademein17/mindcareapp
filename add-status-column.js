// Add missing status column to Meetings table
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mental_health_db',
  password: 'dehiwalaZoo',
  port: 5432,
});

async function addStatusColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding missing status column to Meetings table...');
    
    // Add the status column with the enum type and default value
    await client.query(`
      ALTER TABLE "Meetings" 
      ADD COLUMN "status" "public"."enum_Meetings_status" 
      NOT NULL DEFAULT 'pending';
    `);
    
    console.log('✅ Successfully added status column!');
    
    // Verify the column was added
    const columnCheck = await client.query(`
      SELECT column_name, data_type, udt_name, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Meetings' AND column_name = 'status' AND table_schema = 'public';
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('📋 Status column details:');
      console.log(`  - Column: ${columnCheck.rows[0].column_name}`);
      console.log(`  - Type: ${columnCheck.rows[0].data_type}`);
      console.log(`  - UDT: ${columnCheck.rows[0].udt_name}`);
      console.log(`  - Default: ${columnCheck.rows[0].column_default}`);
      
      // Test inserting a meeting with payment_pending status
      console.log('\n🧪 Testing payment_pending status...');
      
      const enrollmentResult = await client.query('SELECT id FROM "Enrollments" LIMIT 1');
      const userResult = await client.query('SELECT id FROM "Users" WHERE role = \'patient\' LIMIT 1');
      const doctorResult = await client.query('SELECT id FROM "Users" WHERE role = \'doctor\' LIMIT 1');
      
      if (enrollmentResult.rows.length > 0 && userResult.rows.length > 0 && doctorResult.rows.length > 0) {
        const enrollmentId = enrollmentResult.rows[0].id;
        const patientId = userResult.rows[0].id;
        const doctorId = doctorResult.rows[0].id;
        
        try {
          const testResult = await client.query(`
            INSERT INTO "Meetings" (
              "patientId", "doctorId", "enrollmentId", "meetingDate", 
              "startTime", "endTime", "status", "consultationFee", 
              "requestedAt", "createdAt", "updatedAt"
            ) VALUES (
              $1, $2, $3, '2024-12-31', '10:00', '11:00', 
              'payment_pending', 50.00, NOW(), NOW(), NOW()
            ) RETURNING id, status;
          `, [patientId, doctorId, enrollmentId]);
          
          console.log('✅ Successfully created meeting with payment_pending status!');
          console.log('📍 Meeting ID:', testResult.rows[0].id, 'Status:', testResult.rows[0].status);
          
          // Clean up test meeting
          await client.query('DELETE FROM "Meetings" WHERE id = $1', [testResult.rows[0].id]);
          console.log('🧹 Test meeting cleaned up');
          
        } catch (insertError) {
          console.error('❌ Failed to insert with payment_pending:', insertError.message);
        }
      } else {
        console.log('⚠️ No sample data found for testing');
      }
    } else {
      console.log('❌ Status column was not added successfully');
    }
    
    console.log('🎉 Meeting status column setup completed!');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Status column already exists!');
    } else {
      console.error('❌ Error adding status column:', error.message);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

addStatusColumn().catch(console.error);
