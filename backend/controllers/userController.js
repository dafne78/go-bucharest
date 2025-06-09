// /backend/controllers/userController.js
const userModel = require('../models/userModel');

/**
 * Get list of users
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
      message: 'Error retrieving users'
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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
      message: 'Error retrieving user'
    });
  }
};

/**
 * Create new user
 */
const createUser = async (req, res) => {
  try {
    const { email, name, role, bio, profileImage } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate a simple ID
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
      message: 'User created successfully',
      data: {
        id: userId,
        ...userData
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio, interests, profileImage } = req.body;

    // Check if user exists
    const existingUser = await userModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update object
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(bio !== undefined && { bio }),
      ...(interests !== undefined && { interests }),
      ...(profileImage && { profileImage })
    };

    await userModel.updateUser(id, updateData);

    // Get updated user
    const updatedUser = await userModel.getUserById(id);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await userModel.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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