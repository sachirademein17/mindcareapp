// API Configuration
const getApiBaseUrl = () => {
  // In development, try to detect the current host
  if (import.meta.env.DEV) {
    // Get the current hostname from the browser
    const hostname = window.location.hostname;
    
    // If running on localhost, use localhost for backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // If running on network IP, use the same IP for backend
    return `http://${hostname}:5000`;
  }
  
  // In production, use environment variable or fallback
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to create API URLs
export const createApiUrl = (endpoint: string) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
