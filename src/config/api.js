// Centralized API configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://cwtakarnataka.com/api";

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Helper function for multipart form data headers
export const getAuthHeadersMultipart = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};
