// /backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Rută publică pentru înregistrare
router.post('/register', authController.register);

// Rută protejată pentru obținerea profilului utilizatorului curent
router.get('/me', protect, authController.getCurrentUser);

//Ruta de logare
router.post('/login', authController.login);

module.exports = router;