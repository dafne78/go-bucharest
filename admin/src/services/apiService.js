// /admin/src/services/api.js
import authService from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

const handleErrors = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Nu șterge token-ul automat, doar afișează eroarea
      console.error('Authentication failed');
      throw new Error('Authentication failed. Please check your credentials.');
    }

    try {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    } catch (e) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }
  return response;
};

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = authService.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Adaugă token-ul în format Bearer
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    await handleErrors(response);
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
        // Nu adăugăm manual Content-Type
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