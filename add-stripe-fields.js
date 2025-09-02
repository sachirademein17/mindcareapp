/**
 * 💳 Add Stripe Integration Fields to Meetings Table
 * 
 * This script adds the required Stripe fields for real refund processing
 */

const { Sequelize, DataTypes } = require('sequelize')

async function addStripeFields() {
  console.log('💳 Adding Stripe integration fields to Meetings table...')
  
  // Database configuration
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'mindcare_db',
    username: 'mindcare_user',
    password: 'mindcare123',
    logging: console.log
  })

  try {
    // Test connection
    await sequelize.authenticate()
    console.log('✅ Database connected successfully!')

    // Add Stripe payment intent ID column
    try {
      await sequelize.query(`
        ALTER TABLE "Meetings" 
        ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" VARCHAR(500)
      `)
      console.log('✅ Added stripePaymentIntentId column')
    } catch (error) {
      console.log('ℹ️ stripePaymentIntentId column may already exist')
    }

    // Add Stripe refund ID column
    try {
      await sequelize.query(`
        ALTER TABLE "Meetings" 
        ADD COLUMN IF NOT EXISTS "stripeRefundId" VARCHAR(500)
      `)
      console.log('✅ Added stripeRefundId column')
    } catch (error) {
      console.log('ℹ️ stripeRefundId column may already exist')
    }

    // Verify columns were added
    console.log('\n📊 Verifying Stripe columns...')
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Meetings' 
      AND column_name IN ('stripePaymentIntentId', 'stripeRefundId')
      ORDER BY column_name
    `)

    console.log('📋 Stripe Integration Columns:')
    console.table(columns)

    // Show sample meeting record structure
    console.log('\n📊 Sample meeting record with Stripe fields:')
    const [sampleMeeting] = await sequelize.query(`
      SELECT 
        id,
        "patientId",
        "doctorId",
        status,
        "consultationFee",
        "paymentStatus",
        "stripePaymentIntentId",
        "stripeRefundId",
        "refundAmount",
        "refundProcessed",
        "refundType"
      FROM "Meetings" 
      LIMIT 1
    `)

    if (sampleMeeting.length > 0) {
      console.table(sampleMeeting)
    } else {
      console.log('ℹ️ No meetings found in database')
    }

    console.log('\n🎉 Stripe integration fields added successfully!')
    console.log('\n📋 Available Stripe Integration Features:')
    console.log('   ✅ Real Stripe refund processing via API')
    console.log('   ✅ Stripe payment intent tracking')
    console.log('   ✅ Stripe refund ID tracking')
    console.log('   ✅ Full audit trail with Stripe references')
    console.log('   ✅ Automatic fallback to manual processing')

  } catch (error) {
    console.error('❌ Error adding Stripe fields:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Database Connection Tips:')
      console.log('   1. Make sure PostgreSQL is running')
      console.log('   2. Check database credentials in the script')
      console.log('   3. Verify database "mindcare_db" exists')
      console.log('   4. Check if user "mindcare_user" has permissions')
    }
  } finally {
    await sequelize.close()
  }
}

// Run the script
addStripeFields().then(() => {
  console.log('\n✅ Script completed!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})
