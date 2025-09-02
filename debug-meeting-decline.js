// 🔍 Debug Meeting Decline Issue
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mental_health_db',
  user: 'postgres',
  password: 'dehiwalaZoo'
});

async function debugMeetingDecline() {
  console.log('🔍 Debugging Meeting Decline & Refund Issue...\n');
  
  try {
    // 1. Check all meetings regardless of payment status
    const allMeetings = await pool.query(`
      SELECT 
        m.id as meeting_id,
        m.status as meeting_status,
        m."paymentStatus",
        m."isPaid",
        m."consultationFee",
        m."declineReason",
        m."declinedAt",
        p.id as payment_id,
        p.status as payment_status,
        p.amount,
        p."stripePaymentIntentId",
        p."stripeRefundId",
        p."refundAmount",
        p."refundReason",
        u_patient.name as patient_name,
        u_doctor.name as doctor_name
      FROM "Meetings" m
      LEFT JOIN "Payments" p ON m.id = p."meetingId"
      LEFT JOIN "Users" u_patient ON m."patientId" = u_patient.id
      LEFT JOIN "Users" u_doctor ON m."doctorId" = u_doctor.id
      ORDER BY m."updatedAt" DESC
      LIMIT 10
    `);
    
    console.log('📋 Recent Meetings (All):');
    console.log('=========================');
    
    if (allMeetings.rows.length === 0) {
      console.log('❌ No meetings found in database');
      return;
    }
    
    allMeetings.rows.forEach((row, index) => {
      console.log(`${index + 1}. Meeting ID: ${row.meeting_id}`);
      console.log(`   Patient: ${row.patient_name}`);
      console.log(`   Doctor: ${row.doctor_name}`);
      console.log(`   Meeting Status: ${row.meeting_status}`);
      console.log(`   Payment Status (Meeting): ${row.paymentStatus}`);
      console.log(`   Is Paid: ${row.isPaid}`);
      console.log(`   Consultation Fee: $${row.consultationFee || '0'}`);
      
      if (row.payment_id) {
        console.log(`   Payment ID: ${row.payment_id}`);
        console.log(`   Payment Status: ${row.payment_status}`);
        console.log(`   Amount: $${row.amount}`);
        console.log(`   Stripe Payment Intent: ${row.stripePaymentIntentId || 'None'}`);
        console.log(`   Refund ID: ${row.stripeRefundId || 'None'}`);
        console.log(`   Refund Amount: $${row.refundAmount || '0'}`);
        console.log(`   Refund Reason: ${row.refundReason || 'None'}`);
      } else {
        console.log(`   ❌ No Payment Record Found`);
      }
      
      if (row.meeting_status === 'declined') {
        console.log(`   📅 Declined At: ${row.declinedAt}`);
        console.log(`   📝 Decline Reason: ${row.declineReason || 'None'}`);
      }
      
      console.log('');
    });
    
    // 2. Check for declined meetings without refunds
    const declinedWithoutRefund = await pool.query(`
      SELECT 
        m.id as meeting_id,
        m."consultationFee",
        m."declineReason",
        p.id as payment_id,
        p.amount,
        p.status as payment_status,
        p."stripePaymentIntentId",
        p."stripeRefundId"
      FROM "Meetings" m
      LEFT JOIN "Payments" p ON m.id = p."meetingId"
      WHERE m.status = 'declined' 
        AND m."consultationFee" > 0
        AND (p."stripeRefundId" IS NULL OR p.status != 'refunded')
      ORDER BY m."updatedAt" DESC
    `);
    
    console.log('⚠️  Declined Meetings Needing Refunds:');
    console.log('======================================');
    
    if (declinedWithoutRefund.rows.length === 0) {
      console.log('✅ No declined meetings found that need refunds');
    } else {
      console.log(`Found ${declinedWithoutRefund.rows.length} declined meeting(s) that may need refunds:`);
      
      declinedWithoutRefund.rows.forEach((row, index) => {
        console.log(`${index + 1}. Meeting ${row.meeting_id}`);
        console.log(`   Consultation Fee: $${row.consultationFee}`);
        console.log(`   Decline Reason: ${row.declineReason || 'None'}`);
        
        if (row.payment_id) {
          console.log(`   Payment Status: ${row.payment_status}`);
          console.log(`   Amount: $${row.amount}`);
          console.log(`   Stripe Payment Intent: ${row.stripePaymentIntentId || 'None'}`);
          console.log(`   Refund ID: ${row.stripeRefundId || 'MISSING - NEEDS REFUND!'}`);
        } else {
          console.log(`   ❌ No payment record found`);
        }
        console.log('');
      });
    }
    
    // 3. Check backend logs for recent decline attempts
    console.log('💡 Debug Steps:');
    console.log('===============');
    console.log('1. Check backend console logs for refund processing messages');
    console.log('2. Look for "✅ Refund processed successfully" or "❌ Error processing refund"');
    console.log('3. Verify Stripe dashboard for refund attempts');
    console.log('4. Check if STRIPE_SECRET_KEY is properly configured');
    console.log('');
    console.log('📝 If meeting was declined but not refunded:');
    console.log('- Check if payment.stripePaymentIntentId exists');
    console.log('- Verify payment status is "completed" in Payments table');
    console.log('- Check meeting.paymentStatus is "pending" or "paid"');
    console.log('- Look for error messages in backend console');
    
  } catch (error) {
    console.error('❌ Error debugging meeting decline:', error);
  } finally {
    await pool.end();
  }
}

debugMeetingDecline();
