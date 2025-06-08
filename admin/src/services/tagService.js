// src/services/tagService.js
import apiService from './apiService';

const tagService = {
  // Obține toate tag-urile
  getAllTags: async () => {
    return await apiService.get('/tags');
  },
  
  // Obține un tag după ID
  getTagById: async (id) => {
    return await apiService.get(`/tags/${id}`);
  },
  
  // Creează un tag nou
  createTag: async (tagData) => {
    return await apiService.post('/tags/add', tagData);
  },
  
  // Actualizează un tag
  updateTag: async (id, tagData) => {
    return await apiService.put(`/tags/${id}`, tagData);
  },
  
  // Șterge un tag
  deleteTag: async (id) => {
    return await apiService.delete(`/tags/${id}`);
  }
};

export default tagService;