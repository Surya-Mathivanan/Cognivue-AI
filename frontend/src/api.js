// API configuration for Vercel frontend + Render backend
// Set VITE_API_BASE_URL in Vercel project settings to your Render backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Export base URL for direct use
export { API_BASE_URL };
