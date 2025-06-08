// /backend/controllers/userController.js
const userModel = require('../models/userModel');

/**
 * Obține lista de utilizatori
 */
const getUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea utilizatorilor'
    });
  }
};

/**
 * Obține un utilizator după ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea utilizatorului'
    });
  }
};

/**
 * Creează un utilizator nou
 */
const createUser = async (req, res) => {
  try {
    const { email, name, role, bio, profileImage } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email-ul este obligatoriu'
      });
    }

    // Generăm un ID simplu
    const userId = Date.now().toString();

    const userData = {
      email,
      name,
      role,
      bio,
      profileImage
    };

    await userModel.createUser(userId, userData);

    res.status(201).json({
      success: true,
      message: 'Utilizatorul a fost creat cu succes',
      data: {
        id: userId,
        ...userData
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea utilizatorului'
    });
  }
};

/**
 * Actualizează un utilizator
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio, interests, profileImage } = req.body;

    // Verifică dacă utilizatorul există
    const existingUser = await userModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    // Construiește obiectul de actualizare
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(bio !== undefined && { bio }),
      ...(interests !== undefined && { interests }),
      ...(profileImage && { profileImage })
    };

    await userModel.updateUser(id, updateData);

    // Obține utilizatorul actualizat
    const updatedUser = await userModel.getUserById(id);

    res.status(200).json({
      success: true,
      message: 'Utilizatorul a fost actualizat cu succes',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea utilizatorului'
    });
  }
};

/**
 * Șterge un utilizator
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifică dacă utilizatorul există
    const existingUser = await userModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    await userModel.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'Utilizatorul a fost șters cu succes'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea utilizatorului'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};