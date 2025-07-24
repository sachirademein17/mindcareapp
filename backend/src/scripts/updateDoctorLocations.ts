// Database update script to standardize doctor locations to Sri Lankan districts
// Run this script to update existing doctor records with valid district names

import { DoctorDetails } from '../models/DoctorDetails'
import { SRI_LANKAN_DISTRICTS, isValidSriLankanDistrict } from '../constants/districts'

export const updateDoctorLocations = async () => {
  try {
    console.log('🔄 Starting doctor location standardization...')
    
    // Get all doctor details
    const doctors = await DoctorDetails.findAll()
    
    let updated = 0
    let skipped = 0
    
    for (const doctor of doctors) {
      const currentLocation = doctor.location
      
      if (!currentLocation) {
        console.log(`⚠️  Doctor ID ${doctor.id}: No location set`)
        skipped++
        continue
      }
      
      // If already a valid district, skip
      if (isValidSriLankanDistrict(currentLocation)) {
        console.log(`✅ Doctor ID ${doctor.id}: Location "${currentLocation}" is already valid`)
        continue
      }
      
      // Try to map common variations to proper district names
      const locationMapping: { [key: string]: string } = {
        // Common variations and misspellings
        'colombo': 'Colombo',
        'kandy': 'Kandy',
        'galle': 'Galle',
        'jaffna': 'Jaffna',
        'matara': 'Matara',
        'kurunegala': 'Kurunegala',
        'anuradhapura': 'Anuradhapura',
        'gampaha': 'Gampaha',
        'kalutara': 'Kalutara',
        'negombo': 'Gampaha', // Negombo is in Gampaha district
        'mount lavinia': 'Colombo',
        'dehiwala': 'Colombo',
        'moratuwa': 'Colombo',
        'kotte': 'Colombo',
        'maharagama': 'Colombo',
        'nugegoda': 'Colombo',
        'kelaniya': 'Gampaha',
        'wattala': 'Gampaha',
        'ja-ela': 'Gampaha',
        'katunayake': 'Gampaha',
        'panadura': 'Kalutara',
        'horana': 'Kalutara',
        'beruwala': 'Kalutara',
        'bentota': 'Galle',
        'hikkaduwa': 'Galle',
        'weligama': 'Matara',
        'tangalle': 'Hambantota',
        'tissamaharama': 'Hambantota',
        'peradeniya': 'Kandy',
        'gampola': 'Kandy',
        'kadugannawa': 'Kandy',
        'nuwara eliya': 'Nuwara Eliya',
        'hatton': 'Nuwara Eliya',
        'dambulla': 'Matale',
        'sigiriya': 'Matale',
        'trincomalee': 'Trincomalee',
        'batticaloa': 'Batticaloa',
        'ampara': 'Ampara',
        'kalmunai': 'Ampara',
        'polonnaruwa': 'Polonnaruwa',
        'puttalam': 'Puttalam',
        'chilaw': 'Puttalam',
        'ratnapura': 'Ratnapura',
        'kegalle': 'Kegalle',
        'mawanella': 'Kegalle',
        'badulla': 'Badulla',
        'bandarawela': 'Badulla',
        'ella': 'Badulla',
        'monaragala': 'Monaragala',
        'wellawaya': 'Monaragala'
      }
      
      const normalizedLocation = currentLocation.toLowerCase().trim()
      const mappedLocation = locationMapping[normalizedLocation]
      
      if (mappedLocation) {
        await doctor.update({ location: mappedLocation })
        console.log(`🔄 Doctor ID ${doctor.id}: Updated "${currentLocation}" → "${mappedLocation}"`)
        updated++
      } else {
        // Try partial matching with existing districts
        const matchedDistrict = SRI_LANKAN_DISTRICTS.find(district =>
          district.toLowerCase().includes(normalizedLocation) ||
          normalizedLocation.includes(district.toLowerCase())
        )
        
        if (matchedDistrict) {
          await doctor.update({ location: matchedDistrict })
          console.log(`🔄 Doctor ID ${doctor.id}: Partial match "${currentLocation}" → "${matchedDistrict}"`)
          updated++
        } else {
          console.log(`⚠️  Doctor ID ${doctor.id}: Could not map location "${currentLocation}"`)
          console.log(`    Available districts: ${SRI_LANKAN_DISTRICTS.join(', ')}`)
          skipped++
        }
      }
    }
    
    console.log('📊 Location standardization completed:')
    console.log(`   ✅ Updated: ${updated} records`)
    console.log(`   ⚠️  Skipped: ${skipped} records`)
    console.log(`   📋 Total: ${doctors.length} records processed`)
    
    return { updated, skipped, total: doctors.length }
    
  } catch (error) {
    console.error('❌ Error updating doctor locations:', error)
    throw error
  }
}

// Helper function to validate all current locations
export const validateCurrentLocations = async () => {
  try {
    console.log('🔍 Validating current doctor locations...')
    
    const doctors = await DoctorDetails.findAll({
      attributes: ['id', 'location']
    })
    
    const invalidLocations: { id: number, location: string }[] = []
    const validLocations: { id: number, location: string }[] = []
    
    for (const doctor of doctors) {
      if (isValidSriLankanDistrict(doctor.location)) {
        validLocations.push({ id: doctor.id, location: doctor.location })
      } else {
        invalidLocations.push({ id: doctor.id, location: doctor.location })
      }
    }
    
    console.log(`✅ Valid locations: ${validLocations.length}`)
    console.log(`❌ Invalid locations: ${invalidLocations.length}`)
    
    if (invalidLocations.length > 0) {
      console.log('\n❌ Invalid locations found:')
      invalidLocations.forEach(({ id, location }) => {
        console.log(`   Doctor ID ${id}: "${location}"`)
      })
    }
    
    return { valid: validLocations, invalid: invalidLocations }
    
  } catch (error) {
    console.error('❌ Error validating locations:', error)
    throw error
  }
}
