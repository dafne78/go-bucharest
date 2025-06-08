// src/services/categoryService.js
import apiService from './apiService';

const locationService = {
  // Obține toate categoriile
  getAllLocations: async () => {
    return await apiService.get('/location-zones/');
  },
  
  // Obține o categorie după ID
  getLocationById: async (id) => {
    return await apiService.get(`/location-zones/${id}`);
  },
  
  // Creează o categorie nouă
  createLocation: async (locationData) => {
    return await apiService.post('/location-zones/', locationData);
  },
  
  // Actualizează o categorie
  updateLocation: async (id, locationData) => {
    return await apiService.put(`/location-zones/${id}`, locationData);
  },
  
  // Șterge o categorie
  deleteLocation: async (id) => {
    return await apiService.delete(`/location-zones/${id}`);
  },

};

export default locationService;