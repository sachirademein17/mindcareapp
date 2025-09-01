// Force Sequelize to sync with updated enum_Meetings_status that includes payment_pending
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mental_health_db',
  password: 'dehiwalaZoo',
  port: 5432,
});

async function forceEnumSync() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Forcing Sequelize enum synchronization...');
    
    // Step 1: Drop the Sequelize-managed enum if it exists
    console.log('1️⃣ Dropping old Sequelize enum...');
    await client.query(`
      DROP TYPE IF EXISTS "public"."enum_Meetings_status" CASCADE;
    `);
    
    // Step 2: Recreate the enum with all required values including payment_pending
    console.log('2️⃣ Creating new enum with payment_pending...');
    await client.query(`
      CREATE TYPE "public"."enum_Meetings_status" AS ENUM(
        'pending', 
        'approved', 
        'declined', 
        'completed', 
        'cancelled', 
        'payment_pending'
      );
    `);
    
    // Step 3: Update the Meetings table to use the new enum
    console.log('3️⃣ Updating Meetings table status column...');
    await client.query(`
      ALTER TABLE "Meetings" 
      ALTER COLUMN "status" TYPE "public"."enum_Meetings_status" 
      USING "status"::"public"."enum_Meetings_status";
    `);
    
    // Step 4: Verify the enum values
    console.log('4️⃣ Verifying enum values...');
    const enumResult = await client.query(`
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
      WHERE n.nspname = 'public' AND t.typname = 'enum_Meetings_status'
      GROUP BY t.typname;
    `);
    
    if (enumResult.rows.length > 0) {
      console.log('✅ Enum successfully updated!');
      console.log('📋 Available status values:', enumResult.rows[0].enum_values);
      
      // Test creating a meeting with payment_pending status
      console.log('5️⃣ Testing payment_pending status...');
      
      // First, get a test enrollment ID
      const enrollmentResult = await client.query('SELECT id FROM "Enrollments" LIMIT 1');
      
      if (enrollmentResult.rows.length > 0) {
        const enrollmentId = enrollmentResult.rows[0].id;
        
        const testMeeting = await client.query(`
          INSERT INTO "Meetings" (
            "patientId", "doctorId", "enrollmentId", "meetingDate", 
            "startTime", "endTime", "status", "consultationFee", 
            "requestedAt", "createdAt", "updatedAt"
          ) VALUES (
            1, 2, $1, '2024-12-31', '10:00', '11:00', 
            'payment_pending', 50.00, NOW(), NOW(), NOW()
          ) RETURNING id, status;
        `, [enrollmentId]);
        
        console.log('✅ Test meeting created with payment_pending status!');
        console.log('📍 Meeting ID:', testMeeting.rows[0].id, 'Status:', testMeeting.rows[0].status);
      } else {
        console.log('⚠️ No enrollments found for testing, but enum is ready');
      }
    } else {
      console.log('❌ Failed to create enum');
    }
    
    console.log('🎉 Sequelize enum sync completed!');
    
  } catch (error) {
    console.error('❌ Error during enum sync:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

forceEnumSync().catch(console.error);
