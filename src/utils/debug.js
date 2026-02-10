// Debug utilities for production troubleshooting
export const logApiCall = (method, url, data = null) => {
  if (import.meta.env.DEV) {
    console.log(`🔗 API ${method.toUpperCase()}: ${url}`, data ? { data } : '');
  }
};

export const logApiError = (error, context = '') => {
  console.error(`❌ API Error ${context}:`, {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method
  });
};

export const logEnvironment = () => {
  console.log('🌍 Environment Info:', {
    mode: import.meta.env.MODE,
    apiUrl: import.meta.env.VITE_API_URL,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD
  });
};