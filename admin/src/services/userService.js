// src/services/userService.js
import apiService from './apiService';

const userService = {
  // Obține lista de utilizatori
  getUsers: async () => {
    return await apiService.get('/users');
  },
  
  // Obține un utilizator după ID
  getUserById: async (id) => {
    return await apiService.get(`/users/${id}`);
  },
  
  // Creează un utilizator nou
  createUser: async (userData) => {
    return await apiService.post('/users', userData);
  },
  
  // Actualizează un utilizator existent
  updateUser: async (id, userData) => {
    return await apiService.put(`/users/${id}`, userData);
  },
  
  // Șterge un utilizator
  deleteUser: async (id) => {
    return await apiService.delete(`/users/${id}`);
  }
};

export default userService;