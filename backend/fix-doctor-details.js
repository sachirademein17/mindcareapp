const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost', 
  database: process.env.DB_NAME || 'mental_health_db',
  password: process.env.DB_PASSWORD || 'dehiwalaZoo',
  port: process.env.DB_PORT || 5432,
});

async function fixDoctorDetailsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing DoctorDetails table...');
    
    // First, update any null values to have defaults
    await client.query(`
      UPDATE "DoctorDetails" 
      SET gender = 'Not specified' 
      WHERE gender IS NULL
    `);
    
    await client.query(`
      UPDATE "DoctorDetails" 
      SET languages = '[]' 
      WHERE languages IS NULL
    `);
    
    await client.query(`
      UPDATE "DoctorDetails" 
      SET location = 'Not specified' 
      WHERE location IS NULL
    `);
    
    await client.query(`
      UPDATE "DoctorDetails" 
      SET qualifications = 'Not specified' 
      WHERE qualifications IS NULL
    `);
    
    await client.query(`
      UPDATE "DoctorDetails" 
      SET bio = 'No bio provided' 
      WHERE bio IS NULL
    `);
    
    console.log('✅ Updated all null values');
    
    // Check if the table structure is correct
    const tableInfo = await client.query(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'DoctorDetails'
    `);
    
    console.log('📋 Current table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    console.log('✅ DoctorDetails table fixed successfully');
    
  } catch (error) {
    console.error('❌ Error fixing DoctorDetails table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Load environment variables
require('dotenv').config();

fixDoctorDetailsTable();
