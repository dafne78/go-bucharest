// /backend/models/locationModel.js
const { db } = require('../config/firebase');

const locationsCollection = 'locations';

/**
 * Creează o nouă locație
 * @param {Object} locationData - Datele locației
 * @returns {Promise<string>} - ID-ul locației create
 */
const createLocation = async (locationData) => {
  try {
    const docRef = await db.collection(locationsCollection).add({
      name: locationData.name,
      address: locationData.address,
      description: locationData.description,
      zoneId: locationData.zoneId,
      coordinates: locationData.coordinates || null, // { latitude, longitude }
      images: locationData.images || [],
      tags: locationData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

/**
 * Obține toate locațiile
 * @param {Object} filters - Filtre opționale (tags, zone, etc.)
 * @returns {Promise<Array>} - Lista de locații
 */
const getAllLocations = async (filters = {}) => {
  try {
    let query = db.collection(locationsCollection);
    
    // Aplicare filtre
    if (filters.zoneId) {
      query = query.where('zoneId', '==', filters.zoneId);
    }
    
    if (filters.tag) {
      query = query.where('tags', 'array-contains', filters.tag);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all locations:', error);
    throw error;
  }
};

/**
 * Obține o locație după ID
 * @param {string} locationId - ID-ul locației
 * @returns {Promise<Object|null>} - Datele locației sau null
 */
const getLocationById = async (locationId) => {
  try {
    const locationDoc = await db.collection(locationsCollection).doc(locationId).get();

    if (!locationDoc.exists) {
      return null;
    }

    return {
      id: locationDoc.id,
      ...locationDoc.data()
    };
  } catch (error) {
    console.error('Error getting location by ID:', error);
    throw error;
  }
};

/**
 * Actualizează o locație
 * @param {string} locationId - ID-ul locației
 * @param {Object} updateData - Datele care trebuie actualizate
 * @returns {Promise<void>}
 */
const updateLocation = async (locationId, updateData) => {
  try {
    await db.collection(locationsCollection).doc(locationId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

/**
 * Șterge o locație
 * @param {string} locationId - ID-ul locației
 * @returns {Promise<void>}
 */
const deleteLocation = async (locationId) => {
  try {
    await db.collection(locationsCollection).doc(locationId).delete();
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
};

/**
 * Adaugă un tag la o locație
 * @param {string} locationId - ID-ul locației
 * @param {string} tagId - ID-ul tag-ului
 * @returns {Promise<void>}
 */
const addTagToLocation = async (locationId, tagId) => {
  try {
    const locationDoc = await db.collection(locationsCollection).doc(locationId).get();
    
    if (!locationDoc.exists) {
      throw new Error('Locația nu a fost găsită');
    }
    
    const locationData = locationDoc.data();
    const tags = locationData.tags || [];
    
    // Verifică dacă tag-ul există deja
    if (!tags.includes(tagId)) {
      await db.collection(locationsCollection).doc(locationId).update({
        tags: [...tags, tagId],
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error adding tag to location:', error);
    throw error;
  }
};

/**
 * Elimină un tag de la o locație
 * @param {string} locationId - ID-ul locației
 * @param {string} tagId - ID-ul tag-ului
 * @returns {Promise<void>}
 */
const removeTagFromLocation = async (locationId, tagId) => {
  try {
    const locationDoc = await db.collection(locationsCollection).doc(locationId).get();
    
    if (!locationDoc.exists) {
      throw new Error('Locația nu a fost găsită');
    }
    
    const locationData = locationDoc.data();
    const tags = locationData.tags || [];
    
    await db.collection(locationsCollection).doc(locationId).update({
      tags: tags.filter(id => id !== tagId),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error removing tag from location:', error);
    throw error;
  }
};

/**
 * Obține locațiile după tag-uri
 * @param {Array<string>} tagIds - Array de ID-uri de tag-uri
 * @returns {Promise<Array>} - Lista de locații
 */
const getLocationsByTags = async (tagIds) => {
  try {
    // Firestore nu suportă căutări cu array-contains pentru mai multe valori
    // Așa că folosim o abordare diferită
    const snapshot = await db.collection(locationsCollection).get();
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(location => {
        const locationTags = location.tags || [];
        return tagIds.some(tagId => locationTags.includes(tagId));
      });
  } catch (error) {
    console.error('Error getting locations by tags:', error);
    throw error;
  }
};

module.exports = {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  addTagToLocation,
  removeTagFromLocation,
  getLocationsByTags
};