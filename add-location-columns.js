const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './backend/.env' });

async function addLocationColumns() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: true
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check current columns in DoctorDetails
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'DoctorDetails' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Current DoctorDetails columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Add missing columns
    const columnsToAdd = [
      { name: 'city', type: 'VARCHAR(100)' },
      { name: 'address', type: 'TEXT' },
      { name: 'location', type: 'VARCHAR(100)' }
    ];

    for (const column of columnsToAdd) {
      try {
        await sequelize.query(`
          ALTER TABLE "DoctorDetails" 
          ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type};
        `);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        console.log(`⚠️ Column ${column.name} might already exist or error: ${error.message}`);
      }
    }

    // Now update the test doctor with location
    await sequelize.query(`
      UPDATE "DoctorDetails" 
      SET 
        city = 'Colombo',
        address = '123 Galle Road, Colombo 03',
        location = 'Colombo',
        "updatedAt" = NOW()
      WHERE "userId" IN (
        SELECT id FROM "Users" WHERE email = 'testdoctor@mindcare.com' AND role = 'doctor'
      )
    `);

    console.log('✅ Updated doctor location to Colombo');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addLocationColumns();
