// /backend/controllers/authController.js
const { auth, clientAuth, signInWithEmailAndPassword } = require('../config/firebase');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Set JWT secret (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name || email.split('@')[0]
    });

    // Create user profile in Firestore
    await userModel.createUser(userRecord.uid, {
      email,
      name: name || email.split('@')[0],
      role: 'user'
    });

    // Generate JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        token
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Authenticate user with Firebase Client SDK
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
    const userRecord = userCredential.user;

    // Get user role from Firestore
    const userProfile = await userModel.getUserById(userRecord.uid);
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        uid: userRecord.uid, 
        email: userRecord.email, 
        role: userProfile.role || 'user' 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role: userProfile.role || 'user',
        token
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get user profile from Firestore
    const userProfile = await userModel.getUserById(userId);
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile',
      error: error.message
    });
  }
};