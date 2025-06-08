// /backend/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

// Rute publice
router.get('/', locationController.getAllLocations);
router.get('/tags', locationController.getLocationsByTags);
router.get('/:id', locationController.getLocationById);

// Rute protejate (necesită autentificare)
router.post('/', protect, locationController.createLocation);
router.put('/:id', protect, locationController.updateLocation);
router.delete('/:id', protect, locationController.deleteLocation);
router.post('/:id/tags', protect, locationController.addTagToLocation);
router.delete('/:id/tags/:tagId', protect, locationController.removeTagFromLocation);

module.exports = router;