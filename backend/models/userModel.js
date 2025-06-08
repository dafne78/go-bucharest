// /backend/models/userModel.js
const { db } = require('../config/firebase');

const usersCollection = 'users';

/**
 * Obține toți utilizatorii
 * @returns {Promise<Array>} - Lista de utilizatori
 */
const getAllUsers = async () => {
  try {
    const snapshot = await db.collection(usersCollection).get();
    
    const users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Obține un utilizator după ID
 * @param {string} userId - ID-ul utilizatorului
 * @returns {Promise<Object|null>} - Datele utilizatorului sau null
 */
const getUserById = async (userId) => {
  try {
    const userDoc = await db.collection(usersCollection).doc(userId).get();

    if (!userDoc.exists) {
      return null;
    }

    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * Creează un nou utilizator
 * @param {string} userId - ID-ul utilizatorului
 * @param {Object} userData - Datele utilizatorului
 * @returns {Promise<void>}
 */
const createUser = async (userId, userData) => {
  try {
    const userToCreate = {
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      role: userData.role || 'user',
      bio: userData.bio || '',
      interests: userData.interests || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Adaugă câmpuri opționale
    if (userData.profileImage) userToCreate.profileImage = userData.profileImage;

    await db.collection(usersCollection).doc(userId).set(userToCreate);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Actualizează un utilizator
 * @param {string} userId - ID-ul utilizatorului
 * @param {Object} updateData - Datele care trebuie actualizate
 * @returns {Promise<void>}
 */
const updateUser = async (userId, updateData) => {
  try {
    await db.collection(usersCollection).doc(userId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Șterge un utilizator
 * @param {string} userId - ID-ul utilizatorului
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
  try {
    await db.collection(usersCollection).doc(userId).delete();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};