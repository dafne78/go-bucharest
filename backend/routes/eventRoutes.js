// /backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// Rute publice specifice (acestea trebuie să vină ÎNAINTE de rutele cu parametri)
router.get('/categories', eventController.getEventsByCategories);
router.get('/zones/:zone', eventController.getEventsByZone);
router.get('/cost', eventController.getEventsByCostRange);
router.get('/upcoming', eventController.getUpcomingEvents);

// Rute care necesită autentificare (specifice)
router.get('/user', protect, eventController.getUserEvents);

// Rute publice generale
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Rute care necesită autentificare (cu parametri)
router.post('/', protect, eventController.createEvent);
router.put('/:id', protect, eventController.updateEvent);
router.delete('/:id', protect, eventController.deleteEvent);

// Rute pentru categorii
router.post('/:id/categories', protect, eventController.addCategoryToEvent);
router.delete('/:id/categories/:categoryId', protect, eventController.removeCategoryFromEvent);

// Rute pentru recenzii
router.post('/:id/reviews', protect, eventController.addReviewToEvent);
router.delete('/:id/reviews/:reviewId', protect, eventController.removeReviewFromEvent);

module.exports = router;