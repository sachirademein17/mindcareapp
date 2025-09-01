// Fix Sequelize enum synchronization with payment_pending
const { Client } = require('pg');

async function fixEnumSequelize() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mental_health_db',
    user: 'postgres',
    password: 'dehiwalaZoo'
  });

  try {
    await client.connect();
    console.log('🔄 Connected to PostgreSQL...');

    // First check if status column exists
    const columnCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'Meetings' 
        AND column_name = 'status'
        AND table_schema = 'public'
      );
    `);
    
    if (!columnCheck.rows[0].exists) {
      console.log('❌ Status column missing! Adding it...');
      
      // First, drop any existing enum and recreate with all values including payment_pending
      console.log('🔄 Creating enum with all values...');
      
      // Drop enum if exists
      await client.query(`
        DROP TYPE IF EXISTS "public"."enum_Meetings_status" CASCADE;
      `);
      
      // Create enum with all values including payment_pending
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
      
      // Add the status column with the new enum type
      await client.query(`
        ALTER TABLE "Meetings" 
        ADD COLUMN "status" "public"."enum_Meetings_status" 
        NOT NULL DEFAULT 'pending';
      `);
      
      console.log('✅ Successfully added status column with payment_pending enum!');
    } else {
      console.log('✅ Status column already exists, updating enum...');
      
      // Drop enum cascade to handle dependencies
      await client.query(`
        DROP TYPE IF EXISTS "public"."enum_Meetings_status" CASCADE;
      `);
      
      // Recreate enum with all values including payment_pending
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
      
      // Update the status column to use the new enum
      await client.query(`
        ALTER TABLE "Meetings" 
        ALTER COLUMN "status" TYPE "public"."enum_Meetings_status" 
        USING ("status"::"public"."enum_Meetings_status");
      `);
      
      // Set default value
      await client.query(`
        ALTER TABLE "Meetings" 
        ALTER COLUMN "status" SET DEFAULT 'pending';
      `);
      
      console.log('✅ Successfully updated enum with payment_pending!');
    }
    
    // Test the enum
    const result = await client.query(`
      SELECT enumlabel FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'enum_Meetings_status'
      ORDER BY e.enumsortorder;
    `);
    
    console.log('📋 Current enum values:', result.rows.map(r => r.enumlabel));
    
    // Test inserting payment_pending status
    console.log('🧪 Testing payment_pending status insertion...');
    try {
      const insertResult = await client.query(`
        INSERT INTO "Meetings" (
          "patientId", "doctorId", "enrollmentId", 
          "meetingDate", "startTime", "endTime", 
          "consultationFee", "status", "requestedAt", 
          "createdAt", "updatedAt"
        ) VALUES (
          1, 2, 1, 
          '2024-12-20', '10:00', '11:00', 
          50.00, 'payment_pending', NOW(), 
          NOW(), NOW()
        )
        RETURNING id, status;
      `);
      console.log('✅ Successfully inserted meeting with payment_pending status!');
      console.log('📍 Meeting ID:', insertResult.rows[0].id, 'Status:', insertResult.rows[0].status);
    } catch (insertError) {
      console.log('⚠️ Insert test failed (this may be due to missing foreign key data):', insertError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔐 Connection closed');
  }
}

fixEnumSequelize();
