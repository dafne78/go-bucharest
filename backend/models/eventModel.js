// /backend/models/eventModel.js
const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin').firestore;
const fs = require('fs');
const path = require('path');

const eventsCollection = 'events';

/**
 * Creează un nou eveniment
 * @param {Object} eventData - Datele evenimentului
 * @returns {Promise<string>} - ID-ul evenimentului creat
 */
const createEvent = async (eventData) => {
  try {
    // Pregătește obiectul eveniment pentru stocare
    const eventToStore = {
      name: eventData.name,
      image: eventData.image || null,
      cost: eventData.cost || 0,
      description: eventData.description || '',
      reviews: [], // Nu stocăm recenzii direct la creare
      participants: [],
      categories: eventData.categories || [],
      date: eventData.date,
      time: eventData.time,
      location: {
        exact: eventData.location.exact || '',
        zone: eventData.location.zone || '',
        latitude: eventData.location.latitude || 0,
        longitude: eventData.location.longitude || 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: eventData.userId || null // ID-ul utilizatorului care a creat evenimentul
    };

    const docRef = await db.collection(eventsCollection).add(eventToStore);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Obține toate evenimentele
 * @param {Object} filters - Filtre opționale (categorie, zonă, dată, etc.)
 * @returns {Promise<Array>} - Lista de evenimente
 */
const getAllEvents = async (filters = {}) => {
  try {
    let query = db.collection(eventsCollection);
    
    // Aplicare filtre
    if (filters.category) {
      query = query.where('categories', 'array-contains', filters.category);
    }
    
    if (filters.zone) {
      query = query.where('location.zone', '==', filters.zone);
    }
    
    if (filters.date) {
      query = query.where('date', '==', filters.date);
    }
    
    if (filters.minCost !== undefined) {
      query = query.where('cost', '>=', filters.minCost);
    }
    
    if (filters.maxCost !== undefined) {
      query = query.where('cost', '<=', filters.maxCost);
    }
    
    // Sortare
    if (filters.sortBy) {
      if (filters.sortBy === 'date') {
        query = query.orderBy('date', filters.sortOrder || 'asc');
      } else if (filters.sortBy === 'cost') {
        query = query.orderBy('cost', filters.sortOrder || 'asc');
      } else if (filters.sortBy === 'name') {
        query = query.orderBy('name', filters.sortOrder || 'asc');
      }
    }
    
    // Limitare rezultate
    if (filters.limit) {
      query = query.limit(parseInt(filters.limit));
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all events:', error);
    throw error;
  }
};

/**
 * Obține un eveniment după ID
 * @param {string} eventId - ID-ul evenimentului
 * @returns {Promise<Object|null>} - Datele evenimentului sau null
 */
const getEventById = async (eventId) => {
  try {
    const eventDoc = await db.collection(eventsCollection).doc(eventId).get();

    if (!eventDoc.exists) {
      return null;
    }

    return {
      _id: eventDoc.id,
      ...eventDoc.data()
    };
  } catch (error) {
    console.error('Error getting event by ID:', error);
    throw error;
  }
};

/**
 * Actualizează un eveniment
 * @param {string} eventId - ID-ul evenimentului
 * @param {Object} updateData - Datele care trebuie actualizate
 * @returns {Promise<void>}
 */
const updateEvent = async (eventId, updateData) => {
  try {
    // Tratăm separat câmpul location pentru a nu pierde subproprietățile neincluse în actualizare
    if (updateData.location) {
      const eventDoc = await db.collection(eventsCollection).doc(eventId).get();
      if (eventDoc.exists) {
        const currentLocation = eventDoc.data().location || {};
        updateData.location = {
          ...currentLocation,
          ...updateData.location
        };
      }
    }
    
    // Dacă imaginea se schimbă, șterge imaginea veche
    if (updateData.image) {
      const eventDoc = await db.collection(eventsCollection).doc(eventId).get();
      if (eventDoc.exists) {
        const currentImage = eventDoc.data().image;
        
        // Check if currentImage exists, is a string, and is different from the new image
        if (currentImage && 
            typeof currentImage === 'string' && 
            currentImage !== updateData.image && 
            currentImage.startsWith('/uploads')) {
          try {
            const imagePath = path.join(__dirname, '..', currentImage);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
              console.log(`Old image deleted for event ${eventId}: ${currentImage}`);
            }
          } catch (imageError) {
            console.error(`Error deleting old image for event ${eventId}:`, imageError);
            // Continuă cu actualizarea evenimentului chiar dacă ștergerea imaginii eșuează
          }
        }
      }
    }
    
    await db.collection(eventsCollection).doc(eventId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

/**
 * Șterge un eveniment
 * @param {string} eventId - ID-ul evenimentului
 * @returns {Promise<void>}
 */
const deleteEvent = async (eventId) => {
  try {
    // Obține evenimentul pentru a avea acces la calea imaginii
    const event = await getEventById(eventId);
    
    // Șterge imaginea dacă există
    if (event && event.image && event.image.startsWith('/uploads')) {
      try {
        const imagePath = path.join(__dirname, '..', event.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Image deleted for event ${eventId}: ${event.image}`);
        }
      } catch (imageError) {
        console.error(`Error deleting image for event ${eventId}:`, imageError);
        // Continuă cu ștergerea evenimentului chiar dacă ștergerea imaginii eșuează
      }
    }
    
    // Șterge evenimentul
    await db.collection(eventsCollection).doc(eventId).delete();
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

/**
 * Adaugă o categorie la un eveniment
 * @param {string} eventId - ID-ul evenimentului
 * @param {string} categoryId - ID-ul categoriei
 * @returns {Promise<void>}
 */
const addCategoryToEvent = async (eventId, categoryId) => {
  try {
    const eventDoc = await db.collection(eventsCollection).doc(eventId).get();
    
    if (!eventDoc.exists) {
      throw new Error('Evenimentul nu a fost găsit');
    }
    
    await db.collection(eventsCollection).doc(eventId).update({
      categories: FieldValue.arrayUnion(categoryId),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding category to event:', error);
    throw error;
  }
};

/**
 * Elimină o categorie de la un eveniment
 * @param {string} eventId - ID-ul evenimentului
 * @param {string} categoryId - ID-ul categoriei
 * @returns {Promise<void>}
 */
const removeCategoryFromEvent = async (eventId, categoryId) => {
  try {
    await db.collection(eventsCollection).doc(eventId).update({
      categories: FieldValue.arrayRemove(categoryId),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error removing category from event:', error);
    throw error;
  }
};

/**
 * Adaugă o recenzie la un eveniment
 * @param {string} eventId - ID-ul evenimentului
 * @param {Object} reviewData - Datele recenziei
 * @returns {Promise<string>} - ID-ul recenziei adăugate
 */
const addReviewToEvent = async (eventId, reviewData) => {
  try {
    // Generăm un ID unic pentru recenzie
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    const reviewToAdd = {
      id: reviewId,
      timestamp: new Date().toISOString(),
      userId: reviewData.userId,
      userName: reviewData.userName,
      profilePicture: reviewData.profilePicture || null,
      grade: reviewData.grade,
      reviewText: reviewData.reviewText || ''
    };
    
    await db.collection(eventsCollection).doc(eventId).update({
      reviews: FieldValue.arrayUnion(reviewToAdd),
      updatedAt: new Date().toISOString()
    });
    
    return reviewId;
  } catch (error) {
    console.error('Error adding review to event:', error);
    throw error;
  }
};

/**
 * Elimină o recenzie de la un eveniment
 * @param {string} eventId - ID-ul evenimentului
 * @param {string} reviewId - ID-ul recenziei
 * @returns {Promise<void>}
 */
const removeReviewFromEvent = async (eventId, reviewId) => {
  try {
    const eventDoc = await db.collection(eventsCollection).doc(eventId).get();
    
    if (!eventDoc.exists) {
      throw new Error('Evenimentul nu a fost găsit');
    }
    
    const eventData = eventDoc.data();
    const reviews = eventData.reviews || [];
    
    // Găsește recenzia după ID
    const reviewToRemove = reviews.find(review => review.id === reviewId);
    
    if (!reviewToRemove) {
      throw new Error('Recenzia nu a fost găsită');
    }
    
    // Elimină recenzia din array
    await db.collection(eventsCollection).doc(eventId).update({
      reviews: FieldValue.arrayRemove(reviewToRemove),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error removing review from event:', error);
    throw error;
  }
};

/**
 * Obține evenimente după categorii
 * @param {Array<string>} categoryIds - Array de ID-uri de categorii
 * @returns {Promise<Array>} - Lista de evenimente
 */
const getEventsByCategories = async (categoryIds) => {
  try {
    // Firestore nu suportă array-contains-any pentru mai mult de 10 valori
    // Asigurăm-ne că nu depășim această limită
    const limitedCategoryIds = categoryIds.slice(0, 10);
    
    const snapshot = await db.collection(eventsCollection)
      .where('categories', 'array-contains-any', limitedCategoryIds)
      .get();
    
    return snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting events by categories:', error);
    throw error;
  }
};

/**
 * Obține evenimente după zonă
 * @param {string} zone - Zona evenimentelor
 * @returns {Promise<Array>} - Lista de evenimente
 */
const getEventsByZone = async (zone) => {
  try {
    const snapshot = await db.collection(eventsCollection)
      .where('location.zone', '==', zone)
      .get();
    
    return snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting events by zone:', error);
    throw error;
  }
};

/**
 * Obține evenimente după cost (interval)
 * @param {number} minCost - Costul minim
 * @param {number} maxCost - Costul maxim
 * @returns {Promise<Array>} - Lista de evenimente
 */
const getEventsByCostRange = async (minCost, maxCost) => {
  try {
    let query = db.collection(eventsCollection);
    
    if (minCost !== undefined) {
      query = query.where('cost', '>=', minCost);
    }
    
    if (maxCost !== undefined) {
      query = query.where('cost', '<=', maxCost);
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting events by cost range:', error);
    throw error;
  }
};

/**
 * Obține evenimente viitoare (după data curentă)
 * @returns {Promise<Array>} - Lista de evenimente viitoare
 */
const getUpcomingEvents = async () => {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    const snapshot = await db.collection(eventsCollection)
      .where('date', '>=', currentDate)
      .orderBy('date', 'asc')
      .get();
    
    return snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    throw error;
  }
};

/**
 * Obține evenimente create de un utilizator
 * @param {string} userId - ID-ul utilizatorului
 * @returns {Promise<Array>} - Lista de evenimente
 */
const getEventsByUser = async (userId) => {
  try {
    const snapshot = await db.collection(eventsCollection)
      .where('createdBy', '==', userId)
      .get();
    
    return snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting events by user:', error);
    throw error;
  }
};

/**
 * Adaugă un participant la eveniment
 * @param {string} eventId - ID-ul evenimentului
 * @param {Object} participantData - Datele participantului
 * @returns {Promise<void>}
 */
const addParticipantToEvent = async (eventId, participantData) => {
  try {
    const eventRef = db.collection(eventsCollection).doc(eventId);

    await db.runTransaction(async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      
      if (!eventDoc.exists) {
        throw new Error('Evenimentul nu a fost găsit');
      }

      const eventData = eventDoc.data();
      const participants = eventData.participants || [];
      
      // Verifică dacă participantul există deja
      const existingParticipant = participants.find(p => p.userId === participantData.userId);
      if (existingParticipant) {
        throw new Error('Utilizatorul este deja înregistrat la acest eveniment');
      }

      // Creează obiectul participant
      const newParticipant = {
        userId: participantData.userId,
        userName: participantData.userName,
        userEmail: participantData.userEmail,
        joinedAt: new Date().toISOString()
      };

      // Adaugă noul participant la array
      participants.push(newParticipant);

      // Actualizează documentul în tranzacție
      transaction.update(eventRef, {
        participants: participants,
        updatedAt: new Date().toISOString()
      });

      console.log('Participant added successfully:', {
        eventId,
        participant: newParticipant,
        totalParticipants: participants.length
      });
    });
  } catch (error) {
    console.error('Error adding participant to event:', error);
    throw error;
  }
};

/**
 * Elimină un participant de la eveniment
 * @param {string} eventId - ID-ul evenimentului
 * @param {string} userId - ID-ul utilizatorului
 * @returns {Promise<void>}
 */
const removeParticipantFromEvent = async (eventId, userId) => {
  try {
    const eventRef = db.collection(eventsCollection).doc(eventId);

    await db.runTransaction(async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      
      if (!eventDoc.exists) {
        throw new Error('Evenimentul nu a fost găsit');
      }

      const eventData = eventDoc.data();
      const participants = eventData.participants || [];
      
      // Găsește participantul
      const participantIndex = participants.findIndex(p => p.userId === userId);
      if (participantIndex === -1) {
        throw new Error('Utilizatorul nu este înregistrat la acest eveniment');
      }

      // Elimină participantul din array
      participants.splice(participantIndex, 1);

      // Actualizează documentul în tranzacție
      transaction.update(eventRef, {
        participants: participants,
        updatedAt: new Date().toISOString()
      });

      console.log('Participant removed successfully:', {
        eventId,
        userId,
        remainingParticipants: participants.length
      });
    });
  } catch (error) {
    console.error('Error removing participant from event:', error);
    throw error;
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addCategoryToEvent,
  removeCategoryFromEvent,
  addReviewToEvent,
  removeReviewFromEvent,
  getEventsByCategories,
  getEventsByZone,
  getEventsByCostRange,
  getUpcomingEvents,
  getEventsByUser,
  addParticipantToEvent,
  removeParticipantFromEvent
};