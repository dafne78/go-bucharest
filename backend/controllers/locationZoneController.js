// /backend/controllers/locationZoneController.js
const locationZoneModel = require('../models/locationZoneModel');

// Definim un obiect care va conține toate funcțiile controller
const locationZoneController = {};

/**
 * @desc    Creează o nouă zonă de locație
 * @route   POST /api/location-zones
 * @access  Private/Admin
 */
locationZoneController.createLocationZone = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Numele zonei este obligatoriu'
      });
    }
    
    const zoneId = await locationZoneModel.createLocationZone({ name });
    
    res.status(201).json({
      success: true,
      message: 'Zonă creată cu succes',
      data: {
        id: zoneId,
        name
      }
    });
  } catch (error) {
    console.error('Error in createLocationZone:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea zonei',
      error: error.message
    });
  }
};

/**
 * @desc    Obține toate zonele de locație
 * @route   GET /api/location-zones
 * @access  Public
 */
locationZoneController.getAllLocationZones = async (req, res) => {
  try {
    const zones = await locationZoneModel.getAllLocationZones();
    
    res.json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (error) {
    console.error('Error in getAllLocationZones:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea zonelor',
      error: error.message
    });
  }
};

/**
 * @desc    Obține o zonă de locație după ID
 * @route   GET /api/location-zones/:id
 * @access  Public
 */
locationZoneController.getLocationZoneById = async (req, res) => {
  try {
    const zoneId = req.params.id;
    const zone = await locationZoneModel.getLocationZoneById(zoneId);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona nu a fost găsită'
      });
    }
    
    res.json({
      success: true,
      data: zone
    });
  } catch (error) {
    console.error('Error in getLocationZoneById:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea zonei',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizează o zonă de locație
 * @route   PUT /api/location-zones/:id
 * @access  Private/Admin
 */
locationZoneController.updateLocationZone = async (req, res) => {
  try {
    const zoneId = req.params.id;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Numele zonei este obligatoriu'
      });
    }
    
    const zone = await locationZoneModel.getLocationZoneById(zoneId);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona nu a fost găsită'
      });
    }
    
    await locationZoneModel.updateLocationZone(zoneId, { name });
    
    res.json({
      success: true,
      message: 'Zonă actualizată cu succes',
      data: {
        id: zoneId,
        name
      }
    });
  } catch (error) {
    console.error('Error in updateLocationZone:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea zonei',
      error: error.message
    });
  }
};

/**
 * @desc    Șterge o zonă de locație
 * @route   DELETE /api/location-zones/:id
 * @access  Private/Admin
 */
locationZoneController.deleteLocationZone = async (req, res) => {
  try {
    const zoneId = req.params.id;
    
    const zone = await locationZoneModel.getLocationZoneById(zoneId);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona nu a fost găsită'
      });
    }
    
    await locationZoneModel.deleteLocationZone(zoneId);
    
    res.json({
      success: true,
      message: 'Zonă ștearsă cu succes',
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteLocationZone:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea zonei',
      error: error.message
    });
  }
};

// Exportăm controllerul
module.exports = locationZoneController;