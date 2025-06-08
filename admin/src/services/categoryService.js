// /src/services/categoryService.js
import apiService from './apiService';

const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    try {
      return await apiService.get('/event-categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      return await apiService.get(`/event-categories/${categoryId}`);
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error);
      throw error;
    }
  },

  // Create a new category
  createCategory: async (categoryData) => {
    try {
      return await apiService.post('/event-categories', categoryData);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update a category
  updateCategory: async (categoryId, categoryData) => {
    try {
      return await apiService.put(`/event-categories/${categoryId}`, categoryData);
    } catch (error) {
      console.error(`Error updating category ${categoryId}:`, error);
      throw error;
    }
  },

  // Delete a category
  deleteCategory: async (categoryId) => {
    try {
      return await apiService.delete(`/event-categories/${categoryId}`);
    } catch (error) {
      console.error(`Error deleting category ${categoryId}:`, error);
      throw error;
    }
  },

  // Get categories by tags
  getCategoriesByTags: async (tagIds) => {
    try {
      const tagsParam = Array.isArray(tagIds) ? tagIds.join(',') : tagIds;
      return await apiService.get(`/event-categories/tags?tags=${tagsParam}`);
    } catch (error) {
      console.error('Error fetching categories by tags:', error);
      throw error;
    }
  },

  // Add tag to category
  addTagToCategory: async (categoryId, tagId) => {
    try {
      return await apiService.post(`/event-categories/${categoryId}/tags`, { tagId });
    } catch (error) {
      console.error(`Error adding tag to category ${categoryId}:`, error);
      throw error;
    }
  },

  // Remove tag from category
  removeTagFromCategory: async (categoryId, tagId) => {
    try {
      return await apiService.delete(`/event-categories/${categoryId}/tags/${tagId}`);
    } catch (error) {
      console.error(`Error removing tag from category ${categoryId}:`, error);
      throw error;
    }
  },

  // Get all tags (for compatibility with existing components)
  getAllTags: async () => {
    try {
      return await apiService.get('/tags');
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }
};

export default categoryService;