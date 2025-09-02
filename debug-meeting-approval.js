const axios = require('axios');

async function debugMeetingApproval() {
    console.log('🔍 Debugging Meeting Approval Issue...\n');
    
    const baseUrl = 'http://localhost:5000/api';
    
    try {
        // First, let's get the details of meetings 45 and 46
        console.log('📋 Fetching meeting 45 details...');
        const meeting45Response = await axios.get(`${baseUrl}/meetings/45`);
        const meeting45 = meeting45Response.data.data;
        
        console.log('Meeting 45 Details:');
        console.log('- ID:', meeting45.id);
        console.log('- Status:', meeting45.status);
        console.log('- Consultation Fee:', meeting45.consultationFee);
        console.log('- Is Paid:', meeting45.isPaid);
        console.log('- Payment Status:', meeting45.paymentStatus);
        console.log('- Doctor ID:', meeting45.doctorId);
        console.log('- Patient ID:', meeting45.patientId);
        console.log('');
        
        console.log('📋 Fetching meeting 46 details...');
        const meeting46Response = await axios.get(`${baseUrl}/meetings/46`);
        const meeting46 = meeting46Response.data.data;
        
        console.log('Meeting 46 Details:');
        console.log('- ID:', meeting46.id);
        console.log('- Status:', meeting46.status);
        console.log('- Consultation Fee:', meeting46.consultationFee);
        console.log('- Is Paid:', meeting46.isPaid);
        console.log('- Payment Status:', meeting46.paymentStatus);
        console.log('- Doctor ID:', meeting46.doctorId);
        console.log('- Patient ID:', meeting46.patientId);
        console.log('');
        
        // Now try to approve meeting 45 and see the exact error
        console.log('🧪 Testing approval of meeting 45...');
        try {
            const approvalResponse = await axios.post(`${baseUrl}/meetings/45/approve`, {}, {
                headers: {
                    'Authorization': 'Bearer fake-token', // We'll need to use real auth
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Meeting 45 approval successful:', approvalResponse.data);
        } catch (error) {
            console.log('❌ Meeting 45 approval failed:');
            console.log('- Status:', error.response?.status);
            console.log('- Error Message:', error.response?.data?.message);
            console.log('- Full Error:', error.response?.data);
        }
        
        console.log('');
        
        // Try to approve meeting 46
        console.log('🧪 Testing approval of meeting 46...');
        try {
            const approvalResponse = await axios.post(`${baseUrl}/meetings/46/approve`, {}, {
                headers: {
                    'Authorization': 'Bearer fake-token', // We'll need to use real auth
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Meeting 46 approval successful:', approvalResponse.data);
        } catch (error) {
            console.log('❌ Meeting 46 approval failed:');
            console.log('- Status:', error.response?.status);
            console.log('- Error Message:', error.response?.data?.message);
            console.log('- Full Error:', error.response?.data);
        }
        
    } catch (error) {
        console.log('❌ Error during debugging:', error.message);
    }
}

debugMeetingApproval();
