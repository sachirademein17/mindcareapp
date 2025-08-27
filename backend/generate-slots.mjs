import { TimeSlot, DoctorAvailability, sequelize } from './src/models/index.js';

// Utility functions
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const generateHourlySlots = (startTime, endTime) => {
  const slots = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  for (let current = startMinutes; current < endMinutes; current += 60) {
    const slotStart = minutesToTime(current);
    const slotEnd = minutesToTime(current + 60);
    
    if (current + 60 <= endMinutes) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd
      });
    }
  }
  
  return slots;
};

async function generateSlotsForDoctor() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    const doctorId = 3;
    const startDate = '2025-08-26'; // Today
    const endDate = '2025-09-02';   // Next 7 days
    
    console.log(`📅 Generating slots for doctor ${doctorId} from ${startDate} to ${endDate}`);
    
    // Get doctor's availability
    const availabilities = await DoctorAvailability.findAll({
      where: { doctorId, isActive: true }
    });
    
    console.log(`📋 Found ${availabilities.length} availability periods`);
    availabilities.forEach(av => {
      console.log(`   - Day ${av.dayOfWeek}: ${av.startTime}-${av.endTime}`);
    });
    
    if (availabilities.length === 0) {
      console.log('❌ No availability set for this doctor');
      return;
    }
    
    const generatedSlots = [];
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);
    
    while (currentDate <= finalDate) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];
      
      console.log(`📅 Processing ${dateStr} (day ${dayOfWeek})`);
      
      // Find availability for this day
      const dayAvailabilities = availabilities.filter(a => a.dayOfWeek === dayOfWeek);
      
      if (dayAvailabilities.length > 0) {
        console.log(`   ✅ Found availability for day ${dayOfWeek}`);
      }
      
      for (const availability of dayAvailabilities) {
        // Generate 1-hour slots within this availability period
        const slots = generateHourlySlots(availability.startTime, availability.endTime);
        
        console.log(`   📝 Generated ${slots.length} slots for ${availability.startTime}-${availability.endTime}`);
        
        for (const slot of slots) {
          // Check if slot already exists
          const existingSlot = await TimeSlot.findOne({
            where: {
              doctorId,
              date: dateStr,
              startTime: slot.startTime
            }
          });
          
          if (!existingSlot) {
            generatedSlots.push({
              doctorId,
              date: dateStr,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isBooked: false
            });
          } else {
            console.log(`   ⚠️  Slot ${slot.startTime}-${slot.endTime} already exists`);
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (generatedSlots.length > 0) {
      await TimeSlot.bulkCreate(generatedSlots);
      console.log(`✅ Successfully created ${generatedSlots.length} new time slots`);
    } else {
      console.log('ℹ️  No new slots to create');
    }
    
    // Verify slots for today
    const todaySlots = await TimeSlot.findAll({
      where: { doctorId, date: startDate },
      order: [['startTime', 'ASC']]
    });
    
    console.log(`\n📋 Available slots for today (${startDate}):`);
    todaySlots.forEach(slot => {
      console.log(`   - ${slot.startTime}-${slot.endTime} (booked: ${slot.isBooked})`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateSlotsForDoctor();
