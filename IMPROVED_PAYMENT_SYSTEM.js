// 💡 IMPROVED PAYMENT SYSTEM PROPOSAL
// No more refunds needed - only charge when doctor approves!

/*
CURRENT PROBLEMS:
================
❌ Patient pays immediately on booking
❌ Money sits in "pending" state
❌ Complex refund logic when doctor declines
❌ Refund failures leave patients charged
❌ Stripe refund fees
❌ Poor user experience

PROPOSED SOLUTION:
=================
✅ Patient authorizes payment (no charge)
✅ Doctor approves → charge patient
✅ Doctor declines → no charge, no refund
✅ Simpler logic, better UX
✅ No refund complexity
✅ No failed refund scenarios
*/

// 🔧 IMPLEMENTATION PLAN

// 1. MODIFY MEETING BOOKING
/*
OLD FLOW:
---------
Patient books → Stripe charge → Payment "pending" → Doctor decides → Maybe refund

NEW FLOW:
---------
Patient books → Stripe setup (no charge) → Doctor decides → Charge only if approved
*/

// 2. DATABASE CHANGES NEEDED
/*
Add to Meetings table:
- stripeCustomerId (string)
- stripeSetupIntentId (string) 
- stripePaymentMethodId (string)

Update paymentStatus enum:
- 'setup_pending' (new - waiting for doctor decision)
- 'payment_authorized' (new - ready to charge)
- 'paid' (charged after approval)
- 'cancelled' (declined, no charge)
*/

// 3. FRONTEND CHANGES
/*
Booking Page:
- Collect payment method (card details)
- Create SetupIntent instead of PaymentIntent
- Show "Payment method saved, no charge until approved"

Doctor Dashboard:
- Same approve/decline buttons
- Behind the scenes: approve = charge, decline = cancel
*/

// 4. BACKEND IMPLEMENTATION

// A. NEW BOOKING CONTROLLER
async function createBookingWithSetup(req, res) {
  try {
    const { doctorId, meetingDate, startTime, patientNotes } = req.body;
    const patientId = req.user.id;
    
    // Get doctor fee
    const doctor = await User.findByPk(doctorId, {
      include: [{ model: DoctorDetails }]
    });
    
    const consultationFee = doctor.DoctorDetails.consultationFee;
    
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name,
      metadata: { userId: patientId }
    });
    
    // Create SetupIntent (no charge)
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        patientId: patientId,
        doctorId: doctorId,
        consultationFee: consultationFee
      }
    });
    
    // Create meeting with setup info
    const meeting = await Meeting.create({
      patientId,
      doctorId,
      meetingDate,
      startTime,
      endTime: addOneHour(startTime),
      patientNotes,
      consultationFee,
      status: 'pending',
      paymentStatus: 'setup_pending', // NEW STATUS
      stripeCustomerId: customer.id,
      stripeSetupIntentId: setupIntent.id,
      requestedAt: new Date()
    });
    
    res.json({
      success: true,
      meeting,
      clientSecret: setupIntent.client_secret // For frontend
    });
    
  } catch (error) {
    console.error('Error creating booking with setup:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
}

// B. NEW APPROVAL CONTROLLER  
async function approveMeetingWithCharge(req, res) {
  try {
    const { meetingId } = req.params;
    const doctorId = req.user.id;
    
    const meeting = await Meeting.findOne({
      where: { 
        id: meetingId, 
        doctorId, 
        status: 'pending',
        paymentStatus: 'setup_pending'
      }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Get the payment method from SetupIntent
    const setupIntent = await stripe.setupIntents.retrieve(meeting.stripeSetupIntentId);
    
    if (setupIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment method not confirmed' });
    }
    
    // NOW charge the patient
    const paymentIntent = await stripe.paymentIntents.create({
      amount: meeting.consultationFee * 100, // cents
      currency: 'usd',
      customer: meeting.stripeCustomerId,
      payment_method: setupIntent.payment_method,
      confirm: true,
      off_session: true, // No customer interaction
      metadata: {
        meetingId: meetingId,
        patientId: meeting.patientId,
        doctorId: doctorId
      }
    });
    
    // Create payment record
    const payment = await Payment.create({
      meetingId,
      patientId: meeting.patientId,
      doctorId,
      amount: meeting.consultationFee,
      currency: 'USD',
      status: 'completed',
      stripePaymentIntentId: paymentIntent.id,
      paymentMethod: 'stripe',
      paymentDate: new Date()
    });
    
    // Update meeting
    const meetingUrl = `https://meet.jit.si/mindcare-${meetingId}-${Date.now()}`;
    await meeting.update({
      status: 'approved',
      paymentStatus: 'paid',
      isPaid: true,
      paymentId: payment.id,
      approvedAt: new Date(),
      meetingUrl
    });
    
    res.json({
      success: true,
      message: 'Meeting approved and payment charged',
      meeting,
      payment
    });
    
  } catch (stripeError) {
    // Payment failed - decline the meeting
    await meeting.update({
      status: 'declined',
      paymentStatus: 'payment_failed',
      declineReason: 'Payment processing failed during approval',
      declinedAt: new Date()
    });
    
    res.status(400).json({ 
      error: 'Payment failed during approval',
      details: stripeError.message 
    });
  }
}

// C. NEW DECLINE CONTROLLER (NO REFUND!)
async function declineMeetingNoCharge(req, res) {
  try {
    const { meetingId } = req.params;
    const { reason } = req.body;
    const doctorId = req.user.id;
    
    const meeting = await Meeting.findOne({
      where: { 
        id: meetingId, 
        doctorId, 
        status: 'pending' 
      }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Cancel SetupIntent if exists
    if (meeting.stripeSetupIntentId) {
      try {
        await stripe.setupIntents.cancel(meeting.stripeSetupIntentId);
      } catch (e) {
        // SetupIntent might already be used/cancelled
        console.log('SetupIntent cancellation failed:', e.message);
      }
    }
    
    // Simply decline - NO PAYMENT WAS CHARGED!
    await meeting.update({
      status: 'declined',
      paymentStatus: 'cancelled', // Clear status
      declineReason: reason || 'Declined by doctor',
      declinedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Meeting declined - no payment was charged'
    });
    
  } catch (error) {
    console.error('Error declining meeting:', error);
    res.status(500).json({ error: 'Failed to decline meeting' });
  }
}

module.exports = {
  createBookingWithSetup,
  approveMeetingWithCharge,
  declineMeetingNoCharge
};
