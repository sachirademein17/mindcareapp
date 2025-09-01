// 🔍 Debug Script - Test Payment Flow Step by Step
const axios = require('axios')

const baseURL = 'http://localhost:5000'

async function debugPaymentFlow() {
  console.log('🔍 Debugging Payment Flow Issues')
  console.log('=' .repeat(50))

  try {
    // Test 1: Check if backend is responding
    console.log('\n1️⃣  Testing Backend Connectivity...')
    try {
      const healthCheck = await axios.get(`${baseURL}/api/meetings/test`, { timeout: 3000 })
      console.log('✅ Backend is responding')
    } catch (error) {
      try {
        // Try any endpoint to see if server is up
        const response = await axios.get(`${baseURL}/patient/doctors`, { 
          timeout: 3000,
          headers: { Authorization: 'Bearer dummy' }
        })
        console.log('✅ Backend is responding (auth required)')
      } catch (err) {
        console.log('❌ Backend not responding on port 5000')
        console.log('   Please make sure backend server is running')
        return
      }
    }

    // Test 2: Check what happens when we try the booking endpoint
    console.log('\n2️⃣  Testing Booking Endpoint...')
    try {
      const response = await axios.post(`${baseURL}/api/meetings/book`, {
        doctorId: 1,
        enrollmentId: 1,
        meetingDate: '2025-08-30',
        startTime: '14:00',
        patientNotes: 'Test booking'
      }, {
        headers: { Authorization: 'Bearer test' },
        timeout: 5000
      })
      console.log('Response:', response.data)
    } catch (error) {
      if (error.response) {
        console.log('Backend responded with error:', error.response.status, error.response.data)
      } else {
        console.log('Network error:', error.message)
      }
    }

  } catch (error) {
    console.error('Debug script error:', error.message)
  }

  console.log('\n🔧 Additional Debugging Steps:')
  console.log('1. Open http://localhost:5174 in browser')
  console.log('2. Open Developer Tools (F12)')
  console.log('3. Go to Console tab')
  console.log('4. Try to book an appointment')
  console.log('5. Look for these specific messages:')
  console.log('   - "Doctor details response"')
  console.log('   - "Booking meeting with consultation fee"')
  console.log('   - "Booking response"')
  console.log('   - "Payment required, redirecting..."')
  
  console.log('\n📋 Expected Console Output:')
  console.log('> Doctor details response: { DoctorDetail: { consultationFee: 50 } }')
  console.log('> Consultation fee: 50')
  console.log('> Set consultation fee to: 50')
  console.log('> Booking meeting with consultation fee: 50')
  console.log('> Booking response: { meeting: {...}, payment: {...} }')
  console.log('> Payment required, redirecting to payment page...')

  console.log('\n❌ If you see different console output, here are common issues:')
  console.log('• "No consultation fee found" → Doctor profile needs consultation fee')
  console.log('• "Authentication required" → Make sure you\'re logged in')
  console.log('• "Active enrollment not found" → Patient needs to enroll with doctor')
  console.log('• "Doctor consultation fee not set" → Set fee in doctor profile')
  console.log('• Network errors → Check if backend is running on port 5000')
}

debugPaymentFlow()
