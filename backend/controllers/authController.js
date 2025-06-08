// /backend/controllers/authController.js
const { auth } = require('../config/firebase');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Setează un secret pentru JWT (ar trebui să fie în .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * @desc    Înregistrare utilizator nou
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email și parola sunt obligatorii'
      });
    }

    // Creează utilizatorul în Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name || email.split('@')[0]
    });

    // Creează profilul utilizatorului în Firestore
    await userModel.createUser(userRecord.uid, {
      email,
      name: name || email.split('@')[0],
      role: 'user'
    });

    // Generează JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'Utilizator înregistrat cu succes',
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
 * @desc    Login utilizator
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email și parola sunt obligatorii'
      });
    }

    // Găsește utilizatorul după email
    const userRecord = await auth.getUserByEmail(email);
    
    // Generează JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Autentificare reușită',
      data: {
        userId: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role: userRecord.role,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({
      success: false,
      message: 'Email sau parolă incorecte'
    });
  }
};

/**
 * @desc    Obține profilul utilizatorului curent
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Obține profilul utilizatorului din Firestore
    const userProfile = await userModel.getUserById(userId);
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
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
      message: 'Eroare la obținerea profilului',
      error: error.message
    });
  }
};