const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost', 
  database: process.env.DB_NAME || 'mental_health_db',
  password: process.env.DB_PASSWORD || 'dehiwalaZoo',
  port: process.env.DB_PORT || 5432,
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await client.query(`
      SELECT * FROM "Users" WHERE email = 'admin@mindcare.com'
    `);
    
    if (existingAdmin.rows.length > 0) {
      console.log('ℹ️ Admin user already exists');
      console.log('📧 Email: admin@mindcare.com');
      console.log('🔑 Password: admin123');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    await client.query(`
      INSERT INTO "Users" (email, password, role, name, nic, "isApproved", "createdAt", "updatedAt")
      VALUES ($1, $2, 'admin', 'System Administrator', 'ADMIN001', true, NOW(), NOW())
    `, ['admin@mindcare.com', hashedPassword]);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@mindcare.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Load environment variables
require('dotenv').config();

createAdminUser();
