// /backend/models/tagModel.js (actualizat cu getTagByName)
const { db } = require('../config/firebase');

const tagsCollection = 'tags';

/**
 * Creează un nou tag
 * @param {Object} tagData - Datele tag-ului
 * @returns {Promise<string>} - ID-ul tag-ului creat
 */
const createTag = async (tagData) => {
  try {
    const docRef = await db.collection(tagsCollection).add({
      name: tagData.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

/**
 * Obține toate tag-urile
 * @returns {Promise<Array>} - Lista de tag-uri
 */
const getAllTags = async () => {
  try {
    const snapshot = await db.collection(tagsCollection).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all tags:', error);
    throw error;
  }
};

/**
 * Obține un tag după ID
 * @param {string} tagId - ID-ul tag-ului
 * @returns {Promise<Object|null>} - Datele tag-ului sau null
 */
const getTagById = async (tagId) => {
  try {
    const tagDoc = await db.collection(tagsCollection).doc(tagId).get();

    if (!tagDoc.exists) {
      return null;
    }

    return {
      id: tagDoc.id,
      ...tagDoc.data()
    };
  } catch (error) {
    console.error('Error getting tag by ID:', error);
    throw error;
  }
};

/**
 * Obține un tag după nume
 * @param {string} tagName - Numele tag-ului
 * @returns {Promise<Object|null>} - Datele tag-ului sau null
 */
const getTagByName = async (tagName) => {
  try {
    // Folosim o interogare cu filtru pentru a găsi tag-ul după nume
    const snapshot = await db.collection(tagsCollection)
      .where('name', '==', tagName)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    // Returnează primul document găsit
    const tagDoc = snapshot.docs[0];
    return {
      id: tagDoc.id,
      ...tagDoc.data()
    };
  } catch (error) {
    console.error('Error getting tag by name:', error);
    throw error;
  }
};

/**
 * Obține sau creează un tag după nume
 * @param {string} tagName - Numele tag-ului
 * @returns {Promise<Object>} - Datele tag-ului
 */
const getOrCreateTagByName = async (tagName) => {
  try {
    // Încearcă să găsească tag-ul după nume
    const existingTag = await getTagByName(tagName);
    
    // Dacă tag-ul există, îl returnează
    if (existingTag) {
      return existingTag;
    }
    
    // Dacă tag-ul nu există, îl creează
    console.log(`Tag '${tagName}' not found, creating it...`);
    const tagId = await createTag({ name: tagName });
    
    // Returnează tag-ul nou creat
    return {
      id: tagId,
      name: tagName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting or creating tag by name:', error);
    throw error;
  }
};

/**
 * Actualizează un tag
 * @param {string} tagId - ID-ul tag-ului
 * @param {Object} updateData - Datele care trebuie actualizate
 * @returns {Promise<void>}
 */
const updateTag = async (tagId, updateData) => {
  try {
    await db.collection(tagsCollection).doc(tagId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
};

/**
 * Șterge un tag
 * @param {string} tagId - ID-ul tag-ului
 * @returns {Promise<void>}
 */
const deleteTag = async (tagId) => {
  try {
    await db.collection(tagsCollection).doc(tagId).delete();
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  getTagByName,
  getOrCreateTagByName,
  updateTag,
  deleteTag
};