// API Connection Test Utility
import { API_BASE_URL } from './api';

export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing API connection to:', API_BASE_URL);
    
    // Test basic connectivity
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection Successful:', data);
      return { success: true, data };
    } else {
      console.log('❌ API Connection Failed:', response.statusText);
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error('❌ API Connection Error:', error);
    return { success: false, error: error.message };
  }
};

export const testCertificateEndpoint = async (token) => {
  try {
    console.log('🧪 Testing Certificate Endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/certificates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('📡 Certificate Endpoint Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Certificate Endpoint Working:', data);
      return { success: true, data };
    } else {
      const errorData = await response.text();
      console.log('❌ Certificate Endpoint Failed:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('❌ Certificate Endpoint Error:', error);
    return { success: false, error: error.message };
  }
};