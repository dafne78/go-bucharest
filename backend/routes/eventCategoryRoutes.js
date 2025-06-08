// /backend/routes/eventCategoryRoutes.js
const express = require('express');
const router = express.Router();
const eventCategoryController = require('../controllers/eventCategoryController');
const { protect } = require('../middleware/authMiddleware');

// Rute publice
router.get('/', eventCategoryController.getAllEventCategories);
router.get('/tags', eventCategoryController.getEventCategoriesByTags);
router.get('/:id', eventCategoryController.getEventCategoryById);

// Rute protejate (necesită autentificare)
router.use(protect)
router.post('/add',eventCategoryController.createEventCategory);
router.put('/:id', eventCategoryController.updateEventCategory);
router.delete('/:id', eventCategoryController.deleteEventCategory);
router.post('/:id/tags', eventCategoryController.addTagToEventCategory);
router.delete('/:id/tags/:tagId', eventCategoryController.removeTagFromEventCategory);

module.exports = router;