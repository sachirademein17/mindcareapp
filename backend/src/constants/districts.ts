// Sri Lankan Districts - Backend constants for validation

export const SRI_LANKAN_DISTRICTS = [
  // Western Province
  'Colombo',
  'Gampaha',
  'Kalutara',
  
  // Central Province
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  
  // Southern Province
  'Galle',
  'Matara',
  'Hambantota',
  
  // Northern Province
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Mullaitivu',
  'Vavuniya',
  
  // Eastern Province
  'Ampara',
  'Batticaloa',
  'Trincomalee',
  
  // North Western Province
  'Kurunegala',
  'Puttalam',
  
  // North Central Province
  'Anuradhapura',
  'Polonnaruwa',
  
  // Uva Province
  'Badulla',
  'Monaragala',
  
  // Sabaragamuwa Province
  'Ratnapura',
  'Kegalle'
] as const

export type SriLankanDistrict = typeof SRI_LANKAN_DISTRICTS[number]

// Validation function
export const isValidSriLankanDistrict = (district: string): boolean => {
  return SRI_LANKAN_DISTRICTS.includes(district as SriLankanDistrict)
}

// Districts grouped by province (for future use)
export const DISTRICTS_BY_PROVINCE = {
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern Province': ['Galle', 'Matara', 'Hambantota'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
  'Eastern Province': ['Ampara', 'Batticaloa', 'Trincomalee'],
  'North Western Province': ['Kurunegala', 'Puttalam'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
  'Uva Province': ['Badulla', 'Monaragala'],
  'Sabaragamuwa Province': ['Ratnapura', 'Kegalle']
} as const
