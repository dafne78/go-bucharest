// /backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/users
 * @desc    Obține lista de utilizatori
 * @access  Private
 */
router.get('/', protect, userController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obține un utilizator după ID
 * @access  Private
 */
router.get('/:id', protect, userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Creează un utilizator nou
 * @access  Private
 */
router.post('/', protect, userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizează un utilizator existent
 * @access  Private
 */
router.put('/:id', protect, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Șterge un utilizator
 * @access  Private
 */
router.delete('/:id', protect, userController.deleteUser);

module.exports = router;