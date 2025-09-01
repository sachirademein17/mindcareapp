// Fix NULL paymentMethod values in Payments table
const { Client } = require('pg');

async function fixPaymentMethods() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mental_health_db',
    user: 'postgres',
    password: 'dehiwalaZoo',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check current NULL values
    const nullCheck = await client.query('SELECT COUNT(*) FROM "Payments" WHERE "paymentMethod" IS NULL');
    console.log(`Found ${nullCheck.rows[0].count} records with NULL paymentMethod`);

    if (parseInt(nullCheck.rows[0].count) > 0) {
      // Update NULL values to default 'stripe'
      const updateResult = await client.query('UPDATE "Payments" SET "paymentMethod" = \'stripe\' WHERE "paymentMethod" IS NULL');
      console.log(`Updated ${updateResult.rowCount} records`);
    }

    // Verify the fix
    const verifyCheck = await client.query('SELECT COUNT(*) FROM "Payments" WHERE "paymentMethod" IS NULL');
    console.log(`Remaining NULL records: ${verifyCheck.rows[0].count}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixPaymentMethods();
