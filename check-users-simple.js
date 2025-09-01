// Test if we can connect to PostgreSQL and check users
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: false
  }
);

async function testDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Check users
    const [results] = await sequelize.query('SELECT id, name, email, role FROM "Users" LIMIT 5');
    console.log('\n📋 Current users:');
    console.table(results);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatabase();
