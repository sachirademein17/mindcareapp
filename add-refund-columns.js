// 📁 add-refund-columns.js
const { Pool } = require('pg');

async function addRefundColumns() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mental_health_db',
    password: 'dehiwalaZoo',
    port: 5432,
  });

  try {
    console.log('🔧 Adding refund columns to Meetings table...');
    
    const query = `
      ALTER TABLE "Meetings" 
      ADD COLUMN IF NOT EXISTS "refundAmount" DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "refundDate" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "refundReason" TEXT,
      ADD COLUMN IF NOT EXISTS "refundType" VARCHAR(20),
      ADD COLUMN IF NOT EXISTS "refundProcessed" BOOLEAN DEFAULT false;
    `;
    
    await pool.query(query);
    console.log('✅ Refund columns added successfully!');
    
    // Verify the columns were added
    const verifyQuery = `
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'Meetings' 
      AND column_name LIKE 'refund%'
      ORDER BY column_name;
    `;
    
    const result = await pool.query(verifyQuery);
    console.log('📋 Refund columns in Meetings table:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (default: ${row.column_default || 'NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding refund columns:', error.message);
  } finally {
    await pool.end();
  }
}

addRefundColumns();
