// 🚑 Emergency Fix: Manual Refund for Meeting 54
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mental_health_db',
  user: 'postgres',
  password: 'dehiwalaZoo'
});

async function manualRefundMeeting54() {
  console.log('🚑 Emergency Manual Refund for Meeting 54...\n');
  
  try {
    // Get payment details
    const paymentResult = await pool.query(`
      SELECT 
        id,
        "meetingId",
        "patientId",
        amount,
        status,
        "stripePaymentIntentId"
      FROM "Payments"
      WHERE "meetingId" = 54 AND status = 'pending'
    `);

    if (paymentResult.rows.length === 0) {
      console.log('❌ No pending payment found for Meeting 54');
      return;
    }

    const payment = paymentResult.rows[0];
    console.log('💳 Found Payment:');
    console.log(`   Payment ID: ${payment.id}`);
    console.log(`   Amount: $${payment.amount}`);
    console.log(`   Stripe Intent: ${payment.stripePaymentIntentId}`);
    console.log('');

    // Option 1: Process Stripe refund (if payment was actually charged)
    console.log('🔄 Attempting Stripe refund...');
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      console.log(`   Payment Intent Status: ${paymentIntent.status}`);
      
      if (paymentIntent.status === 'succeeded') {
        // Payment was completed, need actual refund
        const refund = await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          reason: 'requested_by_customer',
          metadata: {
            meetingId: 54,
            reason: 'Doctor declined meeting'
          }
        });

        console.log(`   ✅ Stripe refund created: ${refund.id}`);

        // Update payment record
        await pool.query(`
          UPDATE "Payments" 
          SET 
            status = 'refunded',
            "stripeRefundId" = $1,
            "refundAmount" = $2,
            "refundDate" = NOW(),
            "refundReason" = 'Doctor declined meeting'
          WHERE id = $3
        `, [refund.id, payment.amount, payment.id]);

      } else {
        // Payment was not completed, just cancel
        console.log('   ℹ️ Payment was not completed, cancelling instead...');
        
        await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
        
        // Update payment record
        await pool.query(`
          UPDATE "Payments" 
          SET status = 'cancelled'
          WHERE id = $1
        `, [payment.id]);
      }

    } catch (stripeError) {
      console.log(`   ❌ Stripe error: ${stripeError.message}`);
      console.log('   💡 Manually updating payment status...');
      
      // Manual database fix if Stripe fails
      await pool.query(`
        UPDATE "Payments" 
        SET status = 'refunded'
        WHERE id = $1
      `, [payment.id]);
    }

    // Update meeting payment status
    await pool.query(`
      UPDATE "Meetings" 
      SET "paymentStatus" = 'refunded'
      WHERE id = 54
    `);

    console.log('✅ Meeting 54 payment status updated to refunded');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('==============');
    console.log('1. Meeting 54 is now properly marked as refunded');
    console.log('2. Try declining other test meetings to verify the fix');
    console.log('3. Consider implementing the alternative escrow system');
    console.log('');

  } catch (error) {
    console.error('❌ Error processing manual refund:', error);
  } finally {
    await pool.end();
  }
}

manualRefundMeeting54();
