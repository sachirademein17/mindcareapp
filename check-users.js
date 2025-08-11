const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './backend/.env' });

async function checkUsers() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const [results] = await sequelize.query(
      "SELECT id, name, email, role, \"isApproved\" FROM \"Users\" WHERE role IN ('doctor', 'patient') ORDER BY role, id"
    );

    console.log('\n📋 Current Users:');
    console.log('================');
    results.forEach(user => {
      console.log(`${user.role === 'doctor' ? '👨‍⚕️' : '👤'} ${user.role.toUpperCase()}: ${user.name} (${user.email}) - ${user.isApproved ? 'Approved' : 'Pending'}`);
    });

    if (results.filter(u => u.role === 'doctor' && u.isApproved).length === 0) {
      console.log('\n❌ No approved doctors found! You need to:');
      console.log('1. Register a doctor through the frontend');
      console.log('2. Approve the doctor through admin panel');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkUsers();
