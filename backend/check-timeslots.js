import { TimeSlot, sequelize } from './src/models/index.js';

async function checkTimeSlots() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    const slots = await TimeSlot.findAll({
      where: { doctorId: 3, date: '2025-08-26' },
      order: [['startTime', 'ASC']]
    });
    
    console.log(`📅 Time slots found for doctor 3 on 2025-08-26: ${slots.length}`);
    
    if (slots.length === 0) {
      console.log('❌ No time slots found! This explains why patients can\'t see available slots.');
    } else {
      slots.forEach(slot => {
        console.log(`   - ${slot.startTime}-${slot.endTime} (booked: ${slot.isBooked})`);
      });
    }
    
    // Check for any date
    const allSlots = await TimeSlot.findAll({
      where: { doctorId: 3 },
      order: [['date', 'ASC'], ['startTime', 'ASC']],
      limit: 10
    });
    
    console.log(`\n📊 Total slots for doctor 3: ${allSlots.length}`);
    if (allSlots.length > 0) {
      console.log('Sample slots:');
      allSlots.slice(0, 5).forEach(slot => {
        console.log(`   - ${slot.date} ${slot.startTime}-${slot.endTime}`);
      });
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTimeSlots();
