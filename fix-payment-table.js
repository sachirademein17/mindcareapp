const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function fixPaymentTable() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'mental_health_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'dehiwalaZoo',
  });

  try {
    console.log('Connected to database');
    
    // First, check if there are any NULL values in the Payments table
    const checkQuery = 'SELECT COUNT(*) as count FROM "Payments" WHERE "paymentMethod" IS NULL';
    const checkResult = await pool.query(checkQuery);
    console.log(`Found ${checkResult.rows[0].count} NULL paymentMethod records`);
    
    if (checkResult.rows[0].count > 0) {
      // Update all NULL paymentMethod values to 'stripe'
      const updateQuery = 'UPDATE "Payments" SET "paymentMethod" = $1 WHERE "paymentMethod" IS NULL';
      const updateResult = await pool.query(updateQuery, ['stripe']);
      console.log(`Updated ${updateResult.rowCount} records`);
    }
    
    // Now try to check if the column can be made NOT NULL
    const verifyQuery = 'SELECT COUNT(*) as count FROM "Payments" WHERE "paymentMethod" IS NULL';
    const verifyResult = await pool.query(verifyQuery);
    console.log(`Remaining NULL records: ${verifyResult.rows[0].count}`);
    
    // Try to manually add the NOT NULL constraint and DEFAULT
    try {
      console.log('Attempting to fix column constraints...');
      
      // First set the default value
      await pool.query('ALTER TABLE "Payments" ALTER COLUMN "paymentMethod" SET DEFAULT \'stripe\'');
      console.log('✅ Set default value to stripe');
      
      // Then make it NOT NULL
      await pool.query('ALTER TABLE "Payments" ALTER COLUMN "paymentMethod" SET NOT NULL');
      console.log('✅ Set NOT NULL constraint');
      
    } catch (constraintError) {
      console.log('⚠️ Constraint error (might already exist):', constraintError.message);
    }
    
    console.log('✅ Payment table fixed successfully');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixPaymentTable();
