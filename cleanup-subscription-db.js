// Clean up subscription-related database tables
const { Client } = require('pg');
require('dotenv').config();

async function cleanupSubscriptionTables() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'mental_health_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'dehiwalaZoo'
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Drop subscription-related tables
    console.log('🗑️ Dropping DoctorSubscriptions table...');
    await client.query('DROP TABLE IF EXISTS "DoctorSubscriptions" CASCADE');

    // Remove subscription-related columns from DoctorDetails
    console.log('🗑️ Removing subscription columns from DoctorDetails...');
    
    const subscriptionColumns = [
      'subscriptionStatus',
      'lastSubscriptionPayment', 
      'trialEndDate',
      'canAcceptPatients',
      'subscriptionExpiry'
    ];

    for (const column of subscriptionColumns) {
      try {
        await client.query(`ALTER TABLE "DoctorDetails" DROP COLUMN IF EXISTS "${column}"`);
        console.log(`   ✅ Removed column: ${column}`);
      } catch (error) {
        console.log(`   ⚠️ Column ${column} not found or already removed`);
      }
    }

    // Remove platform fee columns from Meetings table
    console.log('🗑️ Removing platform fee columns from Meetings...');
    
    const platformFeeColumns = [
      'platformFee',
      'doctorNetAmount', 
      'platformFeePercentage'
    ];

    for (const column of platformFeeColumns) {
      try {
        await client.query(`ALTER TABLE "Meetings" DROP COLUMN IF EXISTS "${column}"`);
        console.log(`   ✅ Removed column: ${column}`);
      } catch (error) {
        console.log(`   ⚠️ Column ${column} not found or already removed`);
      }
    }

    // Remove processing fee and doctor earnings from Payments
    console.log('🗑️ Removing fee columns from Payments...');
    
    const paymentFeeColumns = [
      'processingFee',
      'doctorEarnings'
    ];

    for (const column of paymentFeeColumns) {
      try {
        await client.query(`ALTER TABLE "Payments" DROP COLUMN IF EXISTS "${column}"`);
        console.log(`   ✅ Removed column: ${column}`);
      } catch (error) {
        console.log(`   ⚠️ Column ${column} not found or already removed`);
      }
    }

    console.log('✅ Database cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error cleaning up database:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

cleanupSubscriptionTables();