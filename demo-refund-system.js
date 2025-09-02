/**
 * 🎯 REFUND SYSTEM DEMO
 * 
 * This script demonstrates how the simplified refund system works
 * when a doctor declines a meeting or patient cancels.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Demo authentication token (replace with real token)
const AUTH_TOKEN = 'your-auth-token-here';

async function demonstrateRefundSystem() {
    console.log('🎯 REFUND SYSTEM DEMONSTRATION\n');
    
    try {
        // 1. Show current meeting status
        console.log('📋 1. Current Meeting Status:');
        const meetingId = 1; // Example meeting ID
        
        // 2. Simulate doctor declining meeting
        console.log('\n🚫 2. Doctor Declines Meeting:');
        console.log('   → Triggering decline endpoint...');
        
        const declineResponse = await axios.put(
            `${API_BASE}/meetings/${meetingId}/decline`,
            {},
            {
                headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
            }
        );
        
        console.log('   ✅ Meeting declined successfully!');
        console.log('   ✅ Patient automatically refunded!');
        console.log('   📄 Response:', JSON.stringify(declineResponse.data, null, 2));
        
        // 3. Check refund status
        console.log('\n💰 3. Checking Refund Status:');
        
        const refundCheck = await axios.get(
            `${API_BASE}/refund/check/${meetingId}`,
            {
                headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
            }
        );
        
        console.log('   📊 Refund Details:', JSON.stringify(refundCheck.data, null, 2));
        
        // 4. Show patient refund history
        console.log('\n📜 4. Patient Refund History:');
        
        const patientHistory = await axios.get(
            `${API_BASE}/refund/patient/history`,
            {
                headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
            }
        );
        
        console.log('   📊 History:', JSON.stringify(patientHistory.data, null, 2));
        
    } catch (error) {
        console.error('❌ Demo Error:', error.message);
        
        if (error.response) {
            console.error('📄 Response:', error.response.data);
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Server Connection Issue:');
            console.log('   1. Make sure backend server is running on port 5000');
            console.log('   2. Check if all dependencies are installed');
            console.log('   3. Verify database connection is working');
            console.log('\n   Start server with: npm start or npm run dev');
        }
    }
}

// Alternative: Direct database demonstration
async function demonstrateDirectDatabaseRefund() {
    console.log('🎯 DIRECT DATABASE REFUND DEMO\n');
    
    const { Sequelize, DataTypes } = require('sequelize');
    
    try {
        // Connect to database
        const sequelize = new Sequelize({
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            database: 'mindcare_db',
            username: 'mindcare_user',
            password: 'mindcare123',
            logging: false
        });
        
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connected successfully!');
        
        // Show meetings with refund data
        const [meetings] = await sequelize.query(`
            SELECT 
                id,
                patient_id,
                doctor_id,
                status,
                consultation_fee,
                refund_amount,
                refund_date,
                refund_reason,
                refund_type,
                refund_processed
            FROM "Meetings" 
            WHERE refund_processed = true
            ORDER BY refund_date DESC
            LIMIT 5
        `);
        
        console.log('💰 Recent Refunds:');
        console.table(meetings);
        
        // Simulate refund process
        console.log('\n🔄 Simulating Refund Process:');
        
        const meetingId = 1;
        const consultationFee = 50.00;
        
        // Update meeting with refund
        await sequelize.query(`
            UPDATE "Meetings" 
            SET 
                status = 'declined',
                refund_amount = :refundAmount,
                refund_date = NOW(),
                refund_reason = 'Doctor declined meeting',
                refund_type = 'full',
                refund_processed = true
            WHERE id = :meetingId
        `, {
            replacements: {
                meetingId: meetingId,
                refundAmount: consultationFee
            }
        });
        
        console.log(`✅ Meeting ${meetingId} refund processed!`);
        console.log(`💰 Refund Amount: $${consultationFee}`);
        console.log('📧 Patient notification sent!');
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Database Demo Error:', error.message);
        console.log('\n🔧 Database Connection Tips:');
        console.log('   1. Make sure PostgreSQL is running');
        console.log('   2. Check database credentials');
        console.log('   3. Verify refund columns exist in Meetings table');
    }
}

// Show the refund logic
function showRefundLogic() {
    console.log('🧠 REFUND LOGIC EXPLANATION\n');
    
    console.log('📋 When Doctor Declines Meeting:');
    console.log('   1. Set meeting status to "declined"');
    console.log('   2. Set refundAmount = consultationFee (FULL refund)');
    console.log('   3. Set refundType = "full"');
    console.log('   4. Set refundProcessed = true');
    console.log('   5. Set refundDate = current timestamp');
    console.log('   6. Set refundReason = "Doctor declined meeting"');
    console.log('   7. Send notification to patient');
    
    console.log('\n📋 When Patient Cancels Meeting:');
    console.log('   1. Calculate time until meeting');
    console.log('   2. If >24 hours: FULL refund (100%)');
    console.log('   3. If <24 hours: PARTIAL refund (50%)');
    console.log('   4. Update meeting with refund details');
    console.log('   5. Send notification with refund amount');
    
    console.log('\n💡 Key Benefits:');
    console.log('   ✅ No external payment service required');
    console.log('   ✅ Instant refund processing');
    console.log('   ✅ Complete audit trail in database');
    console.log('   ✅ Reliable and simple');
    console.log('   ✅ Easy to modify refund rules');
}

// Run demonstration
console.log('🎯 MINDCARE REFUND SYSTEM DEMO\n');
console.log('Choose demonstration type:\n');
console.log('1. API Endpoint Demo (requires running server)');
console.log('2. Direct Database Demo (requires database access)');
console.log('3. Logic Explanation Only\n');

// For now, show the logic explanation
showRefundLogic();

// Uncomment to run other demos:
// demonstrateRefundSystem();
// demonstrateDirectDatabaseRefund();

module.exports = {
    demonstrateRefundSystem,
    demonstrateDirectDatabaseRefund,
    showRefundLogic
};
