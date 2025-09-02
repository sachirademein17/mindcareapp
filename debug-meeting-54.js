// 🔍 Debug Meeting 54 Decline Error
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mental_health_db',
  user: 'postgres',
  password: 'dehiwalaZoo'
});

async function debugMeeting54() {
  console.log('🔍 Debugging Meeting 54 Decline Error...\n');
  
  try {
    // Check meeting 54 details
    const meetingResult = await pool.query(`
      SELECT 
        m.id,
        m.status,
        m."paymentStatus",
        m."isPaid",
        m."doctorId",
        m."patientId",
        m."meetingDate",
        m."startTime",
        p.name AS "patientName",
        d.name AS "doctorName"
      FROM "Meetings" m
      LEFT JOIN "Users" p ON m."patientId" = p.id
      LEFT JOIN "Users" d ON m."doctorId" = d.id
      WHERE m.id = 54
    `);
    
    if (meetingResult.rows.length === 0) {
      console.log('❌ Meeting 54 not found');
      return;
    }
    
    const meeting = meetingResult.rows[0];
    console.log('📋 Meeting 54 Details:');
    console.log('======================');
    console.log(`ID: ${meeting.id}`);
    console.log(`Status: ${meeting.status}`);
    console.log(`Payment Status: ${meeting.paymentStatus}`);
    console.log(`Is Paid: ${meeting.isPaid}`);
    console.log(`Doctor ID: ${meeting.doctorId}`);
    console.log(`Patient ID: ${meeting.patientId}`);
    console.log(`Patient Name: ${meeting.patientName}`);
    console.log(`Doctor Name: ${meeting.doctorName}`);
    console.log(`Scheduled: ${meeting.scheduledDate} at ${meeting.scheduledTime}`);
    console.log('');
    
    // Check associated payments
    const paymentResult = await pool.query(`
      SELECT 
        id,
        "meetingId",
        "patientId",
        "doctorId",
        amount,
        status,
        "stripePaymentIntentId",
        "stripeRefundId",
        "createdAt"
      FROM "Payments"
      WHERE "meetingId" = 54
      ORDER BY "createdAt" DESC
    `);
    
    console.log('💳 Associated Payments:');
    console.log('=======================');
    if (paymentResult.rows.length === 0) {
      console.log('❌ No payments found for Meeting 54');
    } else {
      paymentResult.rows.forEach(payment => {
        console.log(`Payment ID: ${payment.id}`);
        console.log(`  Status: ${payment.status}`);
        console.log(`  Amount: $${payment.amount}`);
        console.log(`  Stripe Intent: ${payment.stripePaymentIntentId}`);
        console.log(`  Stripe Refund: ${payment.stripeRefundId || 'None'}`);
        console.log(`  Created: ${payment.createdAt}`);
        console.log('');
      });
    }
    
    // Check if user 3 is actually the doctor for this meeting
    const doctorCheck = await pool.query(`
      SELECT id, name, email, role 
      FROM "Users" 
      WHERE id = $1
    `, [meeting.doctorId]);
    
    console.log('👨‍⚕️ Doctor Details:');
    console.log('===================');
    if (doctorCheck.rows.length > 0) {
      const doctor = doctorCheck.rows[0];
      console.log(`Doctor ID: ${doctor.id}`);
      console.log(`Name: ${doctor.name}`);
      console.log(`Email: ${doctor.email}`);
      console.log(`Role: ${doctor.role}`);
    }
    
    // Check what payments would be found by the refund query
    const refundQueryResult = await pool.query(`
      SELECT 
        id,
        status,
        amount,
        "stripePaymentIntentId"
      FROM "Payments"
      WHERE "meetingId" = 54 
        AND status IN ('pending', 'completed', 'succeeded')
        AND "stripePaymentIntentId" IS NOT NULL
    `);
    
    console.log('🔍 Payments Found by Refund Query:');
    console.log('===================================');
    if (refundQueryResult.rows.length === 0) {
      console.log('❌ No payments found by refund query');
      console.log('   This could be the issue!');
    } else {
      refundQueryResult.rows.forEach(payment => {
        console.log(`✅ Payment ${payment.id}: status=${payment.status}, amount=$${payment.amount}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging meeting 54:', error);
  } finally {
    await pool.end();
  }
}

debugMeeting54();
