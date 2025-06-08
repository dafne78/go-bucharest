const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createBooking,
  getUserBookings,
  getEventParticipants,
  cancelBooking
} = require('../controllers/bookingController');


// Register for an event
router.post('/add', protect, createBooking);

// Get all events user is participating in
router.get('/my-events', protect, getUserBookings);  

// Get all participants for an event
router.get('/event/:eventId/participants', protect, getEventParticipants);

// Cancel participation
router.delete('/:bookingId', protect, cancelBooking);

module.exports = router; 