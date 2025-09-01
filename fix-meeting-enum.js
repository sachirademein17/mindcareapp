const { Client } = require('pg');

async function fixMeetingEnum() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mental_health_db',
    user: 'postgres',
    password: 'dehiwalaZoo',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // First, drop the existing enum and recreate it with all values
    console.log('Updating enum_Meetings_status...');
    
    // Step 1: Change column to varchar temporarily
    console.log('Converting status column to varchar...');
    await client.query(`
      ALTER TABLE "Meetings" 
      ALTER COLUMN "status" TYPE varchar(20);
    `);
    
    // Step 2: Drop the old enum
    console.log('Dropping old enum...');
    await client.query(`
      DROP TYPE IF EXISTS "public"."enum_Meetings_status" CASCADE;
    `);
    
    // Step 3: Create the new enum with all values including payment_pending
    console.log('Creating new enum with payment_pending...');
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
    
    // Step 4: Convert column back to enum type
    console.log('Converting status column back to enum...');
    await client.query(`
      ALTER TABLE "Meetings" 
      ALTER COLUMN "status" TYPE "public"."enum_Meetings_status" 
      USING ("status"::"public"."enum_Meetings_status");
    `);
    
    // Step 5: Set default value and constraints
    console.log('Setting default value...');
    await client.query(`
      ALTER TABLE "Meetings" 
      ALTER COLUMN "status" SET DEFAULT 'pending';
    `);
    
    await client.query(`
      ALTER TABLE "Meetings" 
      ALTER COLUMN "status" SET NOT NULL;
    `);
    
    console.log('✅ Successfully updated enum_Meetings_status with payment_pending');
    
    // Test insertion with payment_pending status
    console.log('Testing payment_pending status insertion...');
    const testResult = await client.query(`
      SELECT 'payment_pending'::"public"."enum_Meetings_status" as test_status;
    `);
    console.log('✅ payment_pending status works:', testResult.rows[0].test_status);

  } catch (error) {
    console.error('❌ Error fixing Meeting enum:', error.message);
  } finally {
    await client.end();
  }
}

fixMeetingEnum();
