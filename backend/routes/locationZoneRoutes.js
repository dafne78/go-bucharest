// /backend/routes/locationZoneRoutes.js
const express = require('express');
const router = express.Router();
const locationZoneController = require('../controllers/locationZoneController');
const { protect } = require('../middleware/authMiddleware');

// Rute publice
router.get('/', locationZoneController.getAllLocationZones);
router.get('/:id', locationZoneController.getLocationZoneById);

// Rute protejate (necesită autentificare)
router.post('/add', protect, locationZoneController.createLocationZone);
router.put('/:id', protect, locationZoneController.updateLocationZone);
router.delete('/:id', protect, locationZoneController.deleteLocationZone);

module.exports = router;