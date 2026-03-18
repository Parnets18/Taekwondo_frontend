// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://taekwondo-backend-j8w4.onrender.com/api";

// Helper function to get API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Default axios configuration
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
};
