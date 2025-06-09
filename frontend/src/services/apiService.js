// /admin/src/services/api.js
import authService from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

const handleErrors = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    
    if (response.status === 401) {
      throw new Error('Authentication failed. Please check your credentials.');
    }

    // Throw error with server message if it exists
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }
  return response;
};

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = authService.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add token in Bearer format
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const apiService = {
  get: (endpoint) => fetchWithAuth(endpoint),
  
  post: (endpoint, data) => fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  put: (endpoint, data) => fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  patch: (endpoint, data) => fetchWithAuth(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  
  delete: (endpoint) => fetchWithAuth(endpoint, {
    method: 'DELETE'
  }),

  uploadImage: async (url, file) => {
    const token = authService.getToken();

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
        // Don't add Content-Type manually
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || `Image upload failed`);
    }

    return result.data;
  }
};

export default apiService;