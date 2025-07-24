// Sri Lankan Districts - Complete list for location dropdown

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

// Districts grouped by province for better organization (optional for future use)
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

// Helper function to get all districts as an array
export const getAllDistricts = (): string[] => {
  return [...SRI_LANKAN_DISTRICTS]
}

// Helper function to search districts (for future autocomplete functionality)
export const searchDistricts = (query: string): string[] => {
  return SRI_LANKAN_DISTRICTS.filter(district => 
    district.toLowerCase().includes(query.toLowerCase())
  )
}
