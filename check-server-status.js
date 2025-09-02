const axios = require('axios');

async function checkServerStatus() {
    console.log('🔍 Checking Server Status...\n');
    
    const baseUrl = 'http://localhost:5000';
    
    try {
        // Check server health
        console.log('🏥 Testing server health...');
        const healthResponse = await axios.get(`${baseUrl}/api/health`);
        console.log('✅ Server Health:', healthResponse.data);
        console.log('');
        
        // Test a simple meetings endpoint
        console.log('📋 Testing meetings endpoint...');
        try {
            const meetingsResponse = await axios.get(`${baseUrl}/api/meetings`);
            console.log('✅ Meetings endpoint working, found', meetingsResponse.data?.data?.length || 0, 'meetings');
        } catch (error) {
            console.log('❌ Meetings endpoint failed:', error.response?.status, error.response?.data?.message);
        }
        
        // Test specific meeting endpoint
        console.log('');
        console.log('🔍 Testing specific meeting endpoints...');
        for (let id of [45, 46]) {
            try {
                const meetingResponse = await axios.get(`${baseUrl}/api/meetings/${id}`);
                console.log(`✅ Meeting ${id} found:`, {
                    id: meetingResponse.data.data.id,
                    status: meetingResponse.data.data.status,
                    consultationFee: meetingResponse.data.data.consultationFee,
                    isPaid: meetingResponse.data.data.isPaid,
                    paymentStatus: meetingResponse.data.data.paymentStatus
                });
            } catch (error) {
                console.log(`❌ Meeting ${id} not found:`, error.response?.status);
            }
        }
        
    } catch (error) {
        console.log('❌ Server not responding:', error.message);
        console.log('Please make sure the server is running on port 5000');
    }
}

checkServerStatus();
