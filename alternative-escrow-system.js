// 🎯 Alternative Escrow Payment System
// Instead of refunding on decline, only charge when doctor approves

/*
CURRENT SYSTEM PROBLEMS:
========================
1. Patient pays immediately when booking
2. Money sits in "pending" status  
3. If doctor declines, we need to refund
4. Refund logic can fail, leaving patient charged

BETTER ESCROW SYSTEM:
====================
1. Patient provides payment method (card tokenization)
2. NO charge until doctor approves
3. If doctor approves: charge the card and complete payment
4. If doctor declines: no charge, no refund needed
5. Simpler, more reliable, better UX

IMPLEMENTATION STRATEGY:
=======================
*/

// 1. MODIFY BOOKING FLOW
async function createBookingWithEscrow(patientId, doctorId, meetingData) {
  // Step 1: Create Stripe Customer and setup future payment
  const customer = await stripe.customers.create({
    email: patientEmail,
    metadata: { userId: patientId }
  });

  // Step 2: Create SetupIntent for future payment (no charge)
  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ['card'],
    usage: 'off_session', // For future payments
    metadata: {
      meetingId: meetingId,
      patientId: patientId,
      doctorId: doctorId
    }
  });

  // Step 3: Store meeting with payment setup info
  const meeting = await Meeting.create({
    ...meetingData,
    paymentStatus: 'setup_pending', // New status
    isPaid: false,
    stripeCustomerId: customer.id,
    stripeSetupIntentId: setupIntent.id
  });

  return {
    meeting,
    clientSecret: setupIntent.client_secret // For frontend
  };
}

// 2. MODIFY APPROVAL FLOW
async function approveMeetingWithPayment(meetingId, doctorId) {
  const meeting = await Meeting.findOne({
    where: { id: meetingId, doctorId, status: 'pending' }
  });

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  // Step 1: Charge the patient's saved payment method
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: meeting.consultationFee * 100, // Convert to cents
      currency: 'usd',
      customer: meeting.stripeCustomerId,
      payment_method: meeting.stripePaymentMethodId, // From setup
      confirm: true,
      off_session: true, // No customer interaction needed
      metadata: {
        meetingId: meetingId,
        patientId: meeting.patientId,
        doctorId: doctorId
      }
    });

    // Step 2: Update meeting and create payment record
    await meeting.update({
      status: 'approved',
      paymentStatus: 'paid',
      isPaid: true,
      approvedAt: new Date()
    });

    const payment = await Payment.create({
      meetingId: meetingId,
      patientId: meeting.patientId,
      doctorId: doctorId,
      amount: meeting.consultationFee,
      status: 'completed',
      stripePaymentIntentId: paymentIntent.id,
      paymentDate: new Date()
    });

    return { success: true, meeting, payment };

  } catch (stripeError) {
    // Payment failed - decline the meeting
    await meeting.update({
      status: 'declined',
      declineReason: 'Payment processing failed',
      declinedAt: new Date()
    });

    throw new Error('Payment failed during approval');
  }
}

// 3. MODIFY DECLINE FLOW (NO REFUND NEEDED!)
async function declineMeetingNoRefund(meetingId, doctorId, reason) {
  const meeting = await Meeting.findOne({
    where: { id: meetingId, doctorId, status: 'pending' }
  });

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  // Simply decline - no payment was charged yet!
  await meeting.update({
    status: 'declined',
    declineReason: reason,
    declinedAt: new Date(),
    paymentStatus: 'cancelled' // Clear status
  });

  // Cancel the SetupIntent if it exists
  if (meeting.stripeSetupIntentId) {
    try {
      await stripe.setupIntents.cancel(meeting.stripeSetupIntentId);
    } catch (e) {
      console.log('SetupIntent already processed or cancelled');
    }
  }

  // Send notification to patient
  await notificationService.createMeetingDeclineNotification(
    meeting.patientId,
    meetingId,
    doctorId,
    reason
  );

  return { success: true, message: 'Meeting declined - no payment was charged' };
}

// 4. BENEFITS OF THIS APPROACH
/*
✅ No refund logic needed
✅ No "money stuck in pending" issues  
✅ Simpler error handling
✅ Better patient experience (no pre-charge)
✅ Automatic payment failure handling
✅ Cleaner database states
✅ No Stripe refund fees
✅ Faster decline process

MIGRATION STRATEGY:
==================
1. Implement new system for future meetings
2. Handle existing pending payments with current refund logic
3. Gradually migrate to new system
4. Eventually deprecate refund logic for new bookings
*/

module.exports = {
  createBookingWithEscrow,
  approveMeetingWithPayment,
  declineMeetingNoRefund
};
