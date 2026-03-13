// API configuration for Vercel frontend + Render backend
// Set VITE_API_BASE_URL in Vercel project settings to your Render backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Export base URL for direct use
export { API_BASE_URL };

// ─── JWT Token helpers ────────────────────────────────────────────────────────
const TOKEN_KEY = "cognivue_token";

export const saveToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Returns headers with Authorization: Bearer <token> if a token exists.
 * Always include this in authenticated fetch calls.
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Authenticated fetch wrapper ──────────────────────────────────────────────
/**
 * Same as fetch() but automatically attaches the JWT Authorization header.
 * Use this for all API calls that require login.
 */
export const authFetch = (url, options = {}) => {
  const headers = {
    ...(options.headers || {}),
    ...getAuthHeaders(),
  };
  return fetch(url, { credentials: "include", ...options, headers });
};

// ─── Update User Profile ──────────────────────────────────────────────────────
export const updateUserProfile = async (data) => {
  const response = await authFetch(getApiUrl("/api/update-profile/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
};
