const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function fixPaymentEnumColumn() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'mental_health_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'dehiwalaZoo',
  });

  try {
    console.log('Connected to database');
    
    // Step 1: Check current state
    const checkEnum = 'SELECT typname FROM pg_type WHERE typname = \'enum_Payments_paymentMethod\'';
    const enumResult = await pool.query(checkEnum);
    console.log(`Enum exists: ${enumResult.rows.length > 0}`);
    
    // Step 2: Drop default constraint first
    console.log('Dropping default constraint...');
    await pool.query('ALTER TABLE "Payments" ALTER COLUMN "paymentMethod" DROP DEFAULT');
    
    // Step 3: Convert column to enum type with proper casting
    console.log('Converting column to enum type...');
    await pool.query(`
      ALTER TABLE "Payments" 
      ALTER COLUMN "paymentMethod" 
      TYPE "public"."enum_Payments_paymentMethod" 
      USING ("paymentMethod"::"public"."enum_Payments_paymentMethod")
    `);
    
    // Step 4: Set proper enum default value
    console.log('Setting enum default value...');
    await pool.query('ALTER TABLE "Payments" ALTER COLUMN "paymentMethod" SET DEFAULT \'stripe\'::"public"."enum_Payments_paymentMethod"');
    
    // Step 5: Make column NOT NULL
    console.log('Making column NOT NULL...');
    await pool.query('ALTER TABLE "Payments" ALTER COLUMN "paymentMethod" SET NOT NULL');
    
    console.log('✅ Payment enum column fixed successfully');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixPaymentEnumColumn();
