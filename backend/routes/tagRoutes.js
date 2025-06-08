// /backend/routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { protect } = require('../middleware/authMiddleware');

// Rute publice
router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);

// Rute protejate (necesită autentificare)
router.post('/add', protect, tagController.createTag);
router.put('/:id', protect, tagController.updateTag);
router.delete('/:id', protect, tagController.deleteTag);

module.exports = router;