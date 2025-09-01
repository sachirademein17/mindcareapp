// Check Meetings table structure and fix enum
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mental_health_db',
  password: 'dehiwalaZoo',
  port: 5432,
});

async function checkAndFixEnum() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking Meetings table structure...');
    
    // Check if Meetings table exists and its columns
    const tableInfo = await client.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'Meetings' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Meetings table columns:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.udt_name})`);
    });
    
    // Check current enum values
    console.log('\n🔍 Checking current enum values...');
    const enumCheck = await client.query(`
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
      WHERE n.nspname = 'public' AND t.typname = 'enum_Meetings_status'
      GROUP BY t.typname;
    `);
    
    if (enumCheck.rows.length > 0) {
      console.log('📋 Current enum values:', enumCheck.rows[0].enum_values);
      
      // Check if payment_pending is already in the enum
      const hasPaymentPending = enumCheck.rows[0].enum_values.includes('payment_pending');
      
      if (hasPaymentPending) {
        console.log('✅ payment_pending is already in the enum!');
        
        // Test if we can insert a record with payment_pending
        if (tableInfo.rows.find(row => row.column_name === 'status')) {
          console.log('🧪 Testing payment_pending insertion...');
          
          // Get sample data for testing
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
          console.log('⚠️ Status column not found in Meetings table');
        }
      } else {
        console.log('❌ payment_pending is NOT in the enum, adding it...');
        
        try {
          await client.query(`
            ALTER TYPE "public"."enum_Meetings_status" ADD VALUE 'payment_pending';
          `);
          console.log('✅ Added payment_pending to enum!');
        } catch (addError) {
          console.error('❌ Failed to add payment_pending:', addError.message);
        }
      }
    } else {
      console.log('❌ enum_Meetings_status not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndFixEnum().catch(console.error);
