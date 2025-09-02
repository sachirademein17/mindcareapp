// 🔧 Process Missing Refunds for Declined Meetings
const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mental_health_db',
  user: 'postgres',
  password: 'dehiwalaZoo'
});

async function processMissingRefunds() {
  console.log('🔧 Processing Missing Refunds for Declined Meetings...\n');
  
  try {
    // Get declined meetings that need refunds
    const declinedMeetings = await pool.query(`
      SELECT 
        m.id as meeting_id,
        m."patientId",
        m."doctorId",
        m."consultationFee",
        m."declineReason",
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
      ORDER BY m."updatedAt" DESC
    `);
    
    console.log(`Found ${declinedMeetings.rows.length} declined meetings needing refunds:\n`);
    
    if (declinedMeetings.rows.length === 0) {
      console.log('✅ No declined meetings found that need refunds');
      return;
    }
    
    // Process each meeting that needs a refund
    for (const meeting of declinedMeetings.rows) {
      console.log(`🔄 Processing refund for Meeting ${meeting.meeting_id}:`);
      console.log(`   Amount: $${meeting.amount}`);
      console.log(`   Payment Status: ${meeting.payment_status}`);
      console.log(`   Stripe Payment Intent: ${meeting.stripePaymentIntentId}`);
      
      try {
        // Make API call to process refund
        const response = await axios.post(`http://localhost:5000/api/payments/refund`, {
          meetingId: meeting.meeting_id,
          reason: meeting.declineReason || 'Doctor declined meeting - processing missing refund'
        }, {
          headers: {
            'Content-Type': 'application/json',
            // Note: In production, you'd need a valid admin token here
            // For testing, you might need to temporarily disable auth or use a test token
          }
        });
        
        if (response.data.success) {
          console.log(`   ✅ Refund processed successfully`);
          console.log(`   💰 Refund Amount: $${response.data.refund?.amount || meeting.amount}`);
        } else {
          console.log(`   ❌ Refund failed: ${response.data.message || 'Unknown error'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing refund: ${error.response?.data?.error || error.message}`);
        
        // If API call fails, let's try direct database approach for debugging
        console.log(`   📋 Debug info for manual processing:`);
        console.log(`      - Meeting ID: ${meeting.meeting_id}`);
        console.log(`      - Payment ID: ${meeting.payment_id}`);
        console.log(`      - Stripe Payment Intent: ${meeting.stripePaymentIntentId}`);
        console.log(`      - Amount: $${meeting.amount}`);
      }
      
      console.log('');
    }
    
    console.log('💡 Next Steps:');
    console.log('==============');
    console.log('1. Check Stripe dashboard for processed refunds');
    console.log('2. Verify database updates for refunded payments');
    console.log('3. Confirm patients receive refund notifications');
    console.log('4. Test new decline functionality with fresh meetings');
    
  } catch (error) {
    console.error('❌ Error processing missing refunds:', error);
  } finally {
    await pool.end();
  }
}

processMissingRefunds();
