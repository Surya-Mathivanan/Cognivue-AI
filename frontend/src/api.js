// API configuration - use relative URL in production (served by Django)
// For local dev, set VITE_API_BASE_URL=http://localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Export base URL for direct use
export { API_BASE_URL };
