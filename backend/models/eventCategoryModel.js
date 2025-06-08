
// /backend/models/eventCategoryModel.js (actualizat cu funcții pentru nume)
const { db } = require('../config/firebase');

const categoriesCollection = 'event_categories';

/**
 * Creează o nouă categorie de eveniment
 * @param {Object} categoryData - Datele categoriei
 * @returns {Promise<string>} - ID-ul categoriei create
 */
const createEventCategory = async (categoryData) => {
  try {
    const docRef = await db.collection(categoriesCollection).add({
      category_name: categoryData.category_name,
      category_image: categoryData.category_image || null,
      tags: categoryData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating event category:', error);
    throw error;
  }
};

/**
 * Obține toate categoriile de evenimente
 * @returns {Promise<Array>} - Lista de categorii
 */
const getAllEventCategories = async () => {
  try {
    const snapshot = await db.collection(categoriesCollection).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all event categories:', error);
    throw error;
  }
};

/**
 * Obține o categorie de eveniment după ID
 * @param {string} categoryId - ID-ul categoriei
 * @returns {Promise<Object|null>} - Datele categoriei sau null
 */
const getEventCategoryById = async (categoryId) => {
  try {
    const categoryDoc = await db.collection(categoriesCollection).doc(categoryId).get();

    if (!categoryDoc.exists) {
      return null;
    }

    return {
      id: categoryDoc.id,
      ...categoryDoc.data()
    };
  } catch (error) {
    console.error('Error getting event category by ID:', error);
    throw error;
  }
};

/**
 * Obține o categorie de eveniment după nume
 * @param {string} categoryName - Numele categoriei
 * @returns {Promise<Object|null>} - Datele categoriei sau null
 */
const getEventCategoryByName = async (categoryName) => {
  try {
    // Folosim o interogare cu filtru pentru a găsi categoria după nume
    const snapshot = await db.collection(categoriesCollection)
      .where('category_name', '==', categoryName)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    // Returnează primul document găsit
    const categoryDoc = snapshot.docs[0];
    return {
      id: categoryDoc.id,
      ...categoryDoc.data()
    };
  } catch (error) {
    console.error('Error getting event category by name:', error);
    throw error;
  }
};

/**
 * Obține sau creează o categorie de eveniment după nume
 * @param {string} categoryName - Numele categoriei
 * @param {Object} additionalData - Date adiționale pentru creare (opțional)
 * @returns {Promise<Object>} - Datele categoriei
 */
const getOrCreateEventCategoryByName = async (categoryName, additionalData = {}) => {
  try {
    // Încearcă să găsească categoria după nume
    const existingCategory = await getEventCategoryByName(categoryName);
    
    // Dacă categoria există, o returnează
    if (existingCategory) {
      return existingCategory;
    }
    
    // Dacă categoria nu există, o creează
    console.log(`Category '${categoryName}' not found, creating it...`);
    const categoryId = await createEventCategory({ 
      category_name: categoryName,
      ...additionalData
    });
    
    // Returnează categoria nou creată
    return {
      id: categoryId,
      category_name: categoryName,
      tags: additionalData.tags || [],
      category_image: additionalData.category_image || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting or creating event category by name:', error);
    throw error;
  }
};

/**
 * Actualizează o categorie de eveniment
 * @param {string} categoryId - ID-ul categoriei
 * @param {Object} updateData - Datele care trebuie actualizate
 * @returns {Promise<void>}
 */
const updateEventCategory = async (categoryId, updateData) => {
  try {
    await db.collection(categoriesCollection).doc(categoryId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating event category:', error);
    throw error;
  }
};

/**
 * Șterge o categorie de eveniment
 * @param {string} categoryId - ID-ul categoriei
 * @returns {Promise<void>}
 */
const deleteEventCategory = async (categoryId) => {
  try {
    await db.collection(categoriesCollection).doc(categoryId).delete();
  } catch (error) {
    console.error('Error deleting event category:', error);
    throw error;
  }
};

/**
 * Adaugă un tag la o categorie de eveniment
 * @param {string} categoryId - ID-ul categoriei
 * @param {string} tagId - ID-ul tag-ului
 * @returns {Promise<void>}
 */
const addTagToEventCategory = async (categoryId, tagId) => {
  try {
    const categoryDoc = await db.collection(categoriesCollection).doc(categoryId).get();
    
    if (!categoryDoc.exists) {
      throw new Error('Categoria nu a fost găsită');
    }
    
    const categoryData = categoryDoc.data();
    const tags = categoryData.tags || [];
    
    // Verifică dacă tag-ul există deja
    if (!tags.includes(tagId)) {
      await db.collection(categoriesCollection).doc(categoryId).update({
        tags: [...tags, tagId],
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error adding tag to event category:', error);
    throw error;
  }
};

/**
 * Obține tag-urile asociate unei categorii de eveniment
 * @param {string} categoryId - ID-ul categoriei
 * @returns {Promise<Array>} - Lista de ID-uri de tag-uri asociate categoriei
 */
const getCategorysTags = async (categoryId) => {
  try {
    const categoryDoc = await db.collection(categoriesCollection).doc(categoryId).get();
    
    if (!categoryDoc.exists) {
      throw new Error('Category not found');
    }
    
    const categoryData = categoryDoc.data();
    return categoryData.tags || [];
  } catch (error) {
    console.error('Error getting category tags:', error);
    throw error;
  }
};

/**
 * Elimină un tag de la o categorie de eveniment
 * @param {string} categoryId - ID-ul categoriei
 * @param {string} tagId - ID-ul tag-ului
 * @returns {Promise<void>}
 */
const removeTagFromEventCategory = async (categoryId, tagId) => {
  try {
    const categoryDoc = await db.collection(categoriesCollection).doc(categoryId).get();
    
    if (!categoryDoc.exists) {
      throw new Error('Categoria nu a fost găsită');
    }
    
    const categoryData = categoryDoc.data();
    const tags = categoryData.tags || [];
    
    await db.collection(categoriesCollection).doc(categoryId).update({
      tags: tags.filter(id => id !== tagId),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error removing tag from event category:', error);
    throw error;
  }
};

/**
 * Obține categoriile după tag-uri
 * @param {Array<string>} tagIds - Array de ID-uri de tag-uri
 * @returns {Promise<Array>} - Lista de categorii
 */
const getEventCategoriesByTags = async (tagIds) => {
  try {
    const snapshot = await db.collection(categoriesCollection).get();
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(category => {
        const categoryTags = category.tags || [];
        return tagIds.some(tagId => categoryTags.includes(tagId));
      });
  } catch (error) {
    console.error('Error getting event categories by tags:', error);
    throw error;
  }
};

module.exports = {
  createEventCategory,
  getAllEventCategories,
  getEventCategoryById,
  getEventCategoryByName,
  getOrCreateEventCategoryByName,
  updateEventCategory,
  deleteEventCategory,
  addTagToEventCategory,
  removeTagFromEventCategory,
  getEventCategoriesByTags
};