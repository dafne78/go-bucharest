import apiService from './apiService';

const eventService = {
  // Obține lista de evenimente cu opțiuni de filtrare și sortare
  // Ruta: GET /api/events
  getEvents: async (options = {}) => {
    try {
      const { category, zone, date, minCost, maxCost, sortBy, sortOrder, limit } = options;
      
      // Construiește query string pentru opțiuni
      const queryParams = [];
      if (category) queryParams.push(`category=${category}`);
      if (zone) queryParams.push(`zone=${zone}`);
      if (date) queryParams.push(`date=${date}`);
      if (minCost) queryParams.push(`minCost=${minCost}`);
      if (maxCost) queryParams.push(`maxCost=${maxCost}`);
      if (sortBy) queryParams.push(`sortBy=${sortBy}`);
      if (sortOrder) queryParams.push(`sortOrder=${sortOrder}`);
      if (limit) queryParams.push(`limit=${limit}`);
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      return await apiService.get(`/events${queryString}`);
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },
  
  // Obține evenimente după categorii
  // Ruta: GET /api/events/categories?categories=cat1,cat2
  getEventsByCategories: async (categoryIds) => {
    try {
      const categoriesParam = Array.isArray(categoryIds) 
        ? categoryIds.join(',') 
        : categoryIds;
      return await apiService.get(`/events/categories?categories=${categoriesParam}`);
    } catch (error) {
      console.error('Error fetching events by categories:', error);
      throw error;
    }
  },
  
  // Obține evenimente după zonă
  // Ruta: GET /api/events/zones/:zone
  getEventsByZone: async (zone) => {
    try {
      return await apiService.get(`/events/zones/${zone}`);
    } catch (error) {
      console.error(`Error fetching events by zone ${zone}:`, error);
      throw error;
    }
  },
  
  // Obține evenimente după interval de cost
  // Ruta: GET /api/events/cost?minCost=10&maxCost=100
  getEventsByCostRange: async (minCost, maxCost) => {
    try {
      const params = [];
      if (minCost !== undefined) params.push(`minCost=${minCost}`);
      if (maxCost !== undefined) params.push(`maxCost=${maxCost}`);
      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      
      return await apiService.get(`/events/cost${queryString}`);
    } catch (error) {
      console.error('Error fetching events by cost range:', error);
      throw error;
    }
  },
  
  // Obține evenimente viitoare
  // Ruta: GET /api/events/upcoming
  getUpcomingEvents: async () => {
    try {
      return await apiService.get('/events/upcoming');
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },
  
  // Obține un eveniment după ID
  // Ruta: GET /api/events/:id
  getEventById: async (eventId) => {
    try {
      return await apiService.get(`/events/${eventId}`);
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      throw error;
    }
  },
  
  // Obține evenimentele utilizatorului curent (necesită autentificare)
  // Ruta: GET /api/events/user
  getUserEvents: async () => {
    try {
      return await apiService.get('/events/user');
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw error;
    }
  },
  
  // Creează un eveniment nou (necesită autentificare)
  // Ruta: POST /api/events
  createEvent: async (eventData) => {
    try {
      return await apiService.post('/events', eventData);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  // Actualizează un eveniment existent (necesită autentificare)
  // Ruta: PUT /api/events/:id
  updateEvent: async (eventId, eventData) => {
  try {
    console.log('Attempting to update event:', eventId); // Add this
    console.log('Update URL:', `/events/${eventId}`); // Add this
    const result = await apiService.put(`/events/${eventId}`, eventData);
    console.log('Update successful:', result); // Add this
    return result;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    console.error('Error details:', error.response?.data); // Add this
    throw error;
  }
},
  
  // Șterge un eveniment (necesită autentificare)
  // Ruta: DELETE /api/events/:id
  deleteEvent: async (eventId) => {
    try {
      return await apiService.delete(`/events/${eventId}`);
    } catch (error) {
      console.error(`Error deleting event ${eventId}:`, error);
      throw error;
    }
  },
  
  // Adaugă o categorie la un eveniment (necesită autentificare)
  // Ruta: POST /api/events/:id/categories
  addCategoryToEvent: async (eventId, categoryId) => {
    try {
      return await apiService.post(`/events/${eventId}/categories`, { categoryId });
    } catch (error) {
      console.error(`Error adding category to event ${eventId}:`, error);
      throw error;
    }
  },
  
  // Elimină o categorie de la un eveniment (necesită autentificare)
  // Ruta: DELETE /api/events/:id/categories/:categoryId
  removeCategoryFromEvent: async (eventId, categoryId) => {
    try {
      return await apiService.delete(`/events/${eventId}/categories/${categoryId}`);
    } catch (error) {
      console.error(`Error removing category from event ${eventId}:`, error);
      throw error;
    }
  },
  
  // Adaugă o recenzie la un eveniment (necesită autentificare)
  // Ruta: POST /api/events/:id/reviews
  addReviewToEvent: async (eventId, reviewData) => {
    try {
      return await apiService.post(`/events/${eventId}/reviews`, reviewData);
    } catch (error) {
      console.error(`Error adding review to event ${eventId}:`, error);
      throw error;
    }
  },
  
  // Elimină o recenzie de la un eveniment (necesită autentificare)
  // Ruta: DELETE /api/events/:id/reviews/:reviewId
  removeReviewFromEvent: async (eventId, reviewId) => {
    try {
      return await apiService.delete(`/events/${eventId}/reviews/${reviewId}`);
    } catch (error) {
      console.error(`Error removing review from event ${eventId}:`, error);
      throw error;
    }
  }
};

export default eventService;