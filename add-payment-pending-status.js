const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mental_health_db',
  user: 'postgres',
  password: 'dehiwalaZoo'
});

async function addPaymentPendingStatus() {
  try {
    console.log('🔧 Adding payment_pending status to Meeting enum...');
    
    // Add the new enum value to the existing enum type
    await pool.query(`
      ALTER TYPE "public"."enum_Meetings_status" 
      ADD VALUE IF NOT EXISTS 'payment_pending';
    `);
    
    console.log('✅ Successfully added payment_pending status to enum');
    
    // Verify the enum values
    const result = await pool.query(`
      SELECT unnest(enum_range(NULL::"public"."enum_Meetings_status")) AS status_values;
    `);
    
    console.log('📋 Current enum values:');
    result.rows.forEach(row => {
      console.log(`  - ${row.status_values}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding payment_pending status:', error);
  } finally {
    await pool.end();
  }
}

addPaymentPendingStatus();
