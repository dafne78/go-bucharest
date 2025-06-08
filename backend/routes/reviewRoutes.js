// /backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Rute publice
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);
router.get('/event/:eventId', reviewController.getEventReviews);
router.get('/event/:eventId/average', reviewController.getEventAverageGrade);

// Rute care necesită autentificare
router.get('/user/me', protect, reviewController.getUserReviews);
router.post('/add', protect, reviewController.createReview);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;