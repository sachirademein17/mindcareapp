// 🔧 Manual Refund Processing for Previously Declined Meetings
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mental_health_db',
  user: 'postgres',
  password: 'dehiwalaZoo'
});

// Import the PaymentService directly for testing
// Note: This would normally require proper module loading, but for debugging we'll simulate the process

async function manualRefundProcess() {
  console.log('🔧 Processing Refunds for Previously Declined Meetings...\n');
  
  try {
    // Get declined meetings that need refunds
    const declinedMeetings = await pool.query(`
      SELECT 
        m.id as meeting_id,
        m."declineReason",
        m."declinedAt",
        p.id as payment_id,
        p.amount,
        p.status as payment_status,
        p."stripePaymentIntentId",
        p."stripeRefundId"
      FROM "Meetings" m
      JOIN "Payments" p ON m.id = p."meetingId"
      WHERE m.status = 'declined' 
        AND m."consultationFee" > 0
        AND p."stripeRefundId" IS NULL
        AND p."stripePaymentIntentId" IS NOT NULL
        AND p.status IN ('pending', 'completed', 'succeeded')
      ORDER BY m."declinedAt" DESC
    `);
    
    console.log(`Found ${declinedMeetings.rows.length} previously declined meetings needing refunds:\n`);
    
    if (declinedMeetings.rows.length === 0) {
      console.log('✅ No previously declined meetings need refunds');
      return;
    }
    
    for (const meeting of declinedMeetings.rows) {
      console.log(`📋 Meeting ${meeting.meeting_id}:`);
      console.log(`   Declined At: ${meeting.declinedAt}`);
      console.log(`   Decline Reason: ${meeting.declineReason}`);
      console.log(`   Amount: $${meeting.amount}`);
      console.log(`   Payment Status: ${meeting.payment_status}`);
      console.log(`   Stripe Payment Intent: ${meeting.stripePaymentIntentId}`);
      console.log(`   Current Refund ID: ${meeting.stripeRefundId || 'None'}`);
      
      // Mark these meetings for manual processing
      console.log('   🎯 Action Required: Manually decline this meeting again in frontend');
      console.log('      OR create admin script to process refund via PaymentService');
      console.log('');
    }
    
    console.log('💡 Options to Process These Refunds:');
    console.log('====================================');
    console.log('');
    console.log('Option 1 - Frontend Re-decline (Recommended):');
    console.log('1. Login as doctor in frontend');
    console.log('2. Navigate to each meeting');
    console.log('3. Change status back to "pending" in database if needed');
    console.log('4. Decline again to trigger refund with fixed logic');
    console.log('');
    console.log('Option 2 - Direct API Call:');
    console.log('1. Create admin authentication token');
    console.log('2. Call POST /api/payments/refund for each meeting');
    console.log('3. Verify refunds in Stripe dashboard');
    console.log('');
    console.log('Option 3 - Database Status Reset (Quick Fix):');
    console.log('Update meetings back to pending, then decline through frontend:');
    console.log('```sql');
    console.log('UPDATE "Meetings" SET status = \'pending\', "declinedAt" = NULL');
    console.log('WHERE id IN (');
    
    // Generate SQL for resetting statuses
    const meetingIds = declinedMeetings.rows.map(m => m.meeting_id);
    console.log('  ' + meetingIds.join(', '));
    console.log(');');
    console.log('```');
    
  } catch (error) {
    console.error('❌ Error processing manual refunds:', error);
  } finally {
    await pool.end();
  }
}

manualRefundProcess();
