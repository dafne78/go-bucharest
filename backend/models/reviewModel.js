// /backend/models/reviewModel.js
const { db } = require('../config/firebase');

const reviewsCollection = 'reviews';

/**
 * Creează o nouă recenzie
 * @param {Object} reviewData - Datele recenziei
 * @returns {Promise<string>} - ID-ul recenziei create
 */
const createReview = async (reviewData) => {
  try {
    const reviewToStore = {
      userId: reviewData.userId,
      userName: reviewData.userName || 'Utilizator',
      profilePicture: reviewData.profilePicture || null,
      eventId: reviewData.eventId,
      grade: reviewData.grade,
      reviewText: reviewData.reviewText || '',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(reviewsCollection).add(reviewToStore);
    
    // Adaugă recenzia și la eveniment
    if (reviewData.eventId) {
      const eventRef = db.collection('events').doc(reviewData.eventId);
      const eventDoc = await eventRef.get();
      
      if (eventDoc.exists) {
        const eventData = eventDoc.data();
        const reviews = eventData.reviews || [];
        
        // Construiește obiectul recenzie care va fi adăugat la eveniment
        const reviewForEvent = {
          id: docRef.id,
          userId: reviewData.userId,
          userName: reviewData.userName || 'Utilizator',
          profilePicture: reviewData.profilePicture || null,
          grade: reviewData.grade,
          reviewText: reviewData.reviewText || '',
          timestamp: new Date().toISOString()
        };
        
        reviews.push(reviewForEvent);
        
        await eventRef.update({
          reviews,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

/**
 * Obține toate recenziile
 * @param {Object} filters - Filtre opționale
 * @returns {Promise<Array>} - Lista de recenzii
 */
const getAllReviews = async (filters = {}) => {
  try {
    let query = db.collection(reviewsCollection);
    
    // Aplicare filtre
    if (filters.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    
    if (filters.eventId) {
      query = query.where('eventId', '==', filters.eventId);
    }
    
    if (filters.minGrade !== undefined) {
      query = query.where('grade', '>=', filters.minGrade);
    }
    
    if (filters.maxGrade !== undefined) {
      query = query.where('grade', '<=', filters.maxGrade);
    }
    
    // Sortare
    if (filters.sortBy) {
      if (filters.sortBy === 'grade') {
        query = query.orderBy('grade', filters.sortOrder || 'desc');
      } else if (filters.sortBy === 'timestamp') {
        query = query.orderBy('timestamp', filters.sortOrder || 'desc');
      }
    } else {
      // Sortare implicită după timestamp descrescător (cele mai noi întâi)
      query = query.orderBy('timestamp', 'desc');
    }
    
    // Limitare rezultate
    if (filters.limit) {
      query = query.limit(parseInt(filters.limit));
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all reviews:', error);
    throw error;
  }
};

/**
 * Obține o recenzie după ID
 * @param {string} reviewId - ID-ul recenziei
 * @returns {Promise<Object|null>} - Datele recenziei sau null
 */
const getReviewById = async (reviewId) => {
  try {
    const reviewDoc = await db.collection(reviewsCollection).doc(reviewId).get();

    if (!reviewDoc.exists) {
      return null;
    }

    return {
      id: reviewDoc.id,
      ...reviewDoc.data()
    };
  } catch (error) {
    console.error('Error getting review by ID:', error);
    throw error;
  }
};

/**
 * Actualizează o recenzie
 * @param {string} reviewId - ID-ul recenziei
 * @param {Object} updateData - Datele care trebuie actualizate
 * @returns {Promise<void>}
 */
const updateReview = async (reviewId, updateData) => {
  try {
    const reviewDoc = await db.collection(reviewsCollection).doc(reviewId).get();
    
    if (!reviewDoc.exists) {
      throw new Error('Recenzia nu a fost găsită');
    }
    
    // Actualizează recenzia în colecția reviews
    await db.collection(reviewsCollection).doc(reviewId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    // Actualizează recenzia și în eveniment
    const reviewData = reviewDoc.data();
    const eventId = reviewData.eventId;
    
    if (eventId) {
      const eventRef = db.collection('events').doc(eventId);
      const eventDoc = await eventRef.get();
      
      if (eventDoc.exists) {
        const eventData = eventDoc.data();
        const reviews = eventData.reviews || [];
        
        // Găsește recenzia în array-ul de recenzii al evenimentului
        const reviewIndex = reviews.findIndex(review => review.id === reviewId);
        
        if (reviewIndex !== -1) {
          // Actualizează recenzia
          reviews[reviewIndex] = {
            ...reviews[reviewIndex],
            ...updateData,
            timestamp: new Date().toISOString()
          };
          
          await eventRef.update({
            reviews,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Șterge o recenzie
 * @param {string} reviewId - ID-ul recenziei
 * @returns {Promise<void>}
 */
const deleteReview = async (reviewId) => {
  try {
    const reviewDoc = await db.collection(reviewsCollection).doc(reviewId).get();
    
    if (!reviewDoc.exists) {
      throw new Error('Recenzia nu a fost găsită');
    }
    
    // Șterge recenzia din eveniment
    const reviewData = reviewDoc.data();
    const eventId = reviewData.eventId;
    
    if (eventId) {
      const eventRef = db.collection('events').doc(eventId);
      const eventDoc = await eventRef.get();
      
      if (eventDoc.exists) {
        const eventData = eventDoc.data();
        const reviews = eventData.reviews || [];
        
        // Filtrează recenzia din array
        const updatedReviews = reviews.filter(review => review.id !== reviewId);
        
        await eventRef.update({
          reviews: updatedReviews,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    // Șterge recenzia din colecția reviews
    await db.collection(reviewsCollection).doc(reviewId).delete();
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/**
 * Obține recenziile unui utilizator
 * @param {string} userId - ID-ul utilizatorului
 * @returns {Promise<Array>} - Lista de recenzii
 */
const getReviewsByUser = async (userId) => {
  try {
    const snapshot = await db.collection(reviewsCollection)
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting reviews by user:', error);
    throw error;
  }
};

/**
 * Obține recenziile unui eveniment
 * @param {string} eventId - ID-ul evenimentului
 * @returns {Promise<Array>} - Lista de recenzii
 */
const getReviewsByEvent = async (eventId) => {
  try {
    const snapshot = await db.collection(reviewsCollection)
      .where('eventId', '==', eventId)
      .orderBy('timestamp', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting reviews by event:', error);
    throw error;
  }
};

/**
 * Calculează nota medie pentru un eveniment
 * @param {string} eventId - ID-ul evenimentului
 * @returns {Promise<number>} - Nota medie
 */
const getAverageGradeForEvent = async (eventId) => {
  try {
    const reviews = await getReviewsByEvent(eventId);
    
    if (reviews.length === 0) {
      return 0;
    }
    
    const sum = reviews.reduce((total, review) => total + review.grade, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  } catch (error) {
    console.error('Error calculating average grade:', error);
    throw error;
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByUser,
  getReviewsByEvent,
  getAverageGradeForEvent
};