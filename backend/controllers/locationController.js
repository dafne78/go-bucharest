// /backend/controllers/locationController.js
const locationModel = require('../models/locationModel');
const locationZoneModel = require('../models/locationZoneModel');
const tagModel = require('../models/tagModel');

/**
 * @desc    Creează o nouă locație
 * @route   POST /api/locations
 * @access  Private/Admin
 */
exports.createLocation = async (req, res) => {
  try {
    const { name, address, description, zoneId, coordinates, images, tags } = req.body;
    
    if (!name || !address || !zoneId) {
      return res.status(400).json({
        success: false,
        message: 'Numele, adresa și zona sunt obligatorii'
      });
    }
    
    // Verifică dacă zona există
    const zone = await locationZoneModel.getLocationZoneById(zoneId);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona specificată nu există'
      });
    }
    
    // Verifică dacă tag-urile există, dacă sunt specificate
    if (tags && tags.length > 0) {
      for (const tagId of tags) {
        const tag = await tagModel.getTagById(tagId);
        if (!tag) {
          return res.status(404).json({
            success: false,
            message: `Tag-ul cu ID-ul ${tagId} nu există`
          });
        }
      }
    }
    
    const locationId = await locationModel.createLocation({
      name,
      address,
      description,
      zoneId,
      coordinates,
      images,
      tags
    });
    
    const createdLocation = await locationModel.getLocationById(locationId);
    
    res.status(201).json({
      success: true,
      message: 'Locație creată cu succes',
      data: createdLocation
    });
  } catch (error) {
    console.error('Error in createLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea locației',
      error: error.message
    });
  }
};

/**
 * @desc    Obține toate locațiile
 * @route   GET /api/locations
 * @access  Public
 */
exports.getAllLocations = async (req, res) => {
  try {
    const { zoneId, tag } = req.query;
    const filters = {};
    
    if (zoneId) filters.zoneId = zoneId;
    if (tag) filters.tag = tag;
    
    const locations = await locationModel.getAllLocations(filters);
    
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Error in getAllLocations:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea locațiilor',
      error: error.message
    });
  }
};

/**
 * @desc    Obține o locație după ID
 * @route   GET /api/locations/:id
 * @access  Public
 */
exports.getLocationById = async (req, res) => {
  try {
    const locationId = req.params.id;
    const location = await locationModel.getLocationById(locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Locația nu a fost găsită'
      });
    }
    
    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Error in getLocationById:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea locației',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizează o locație
 * @route   PUT /api/locations/:id
 * @access  Private/Admin
 */
exports.updateLocation = async (req, res) => {
  try {
    const locationId = req.params.id;
    const updateData = req.body;
    
    const location = await locationModel.getLocationById(locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Locația nu a fost găsită'
      });
    }
    
    // Verifică dacă zona există, dacă este actualizată
    if (updateData.zoneId) {
      const zone = await locationZoneModel.getLocationZoneById(updateData.zoneId);
      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zona specificată nu există'
        });
      }
    }
    
    // Verifică dacă tag-urile există, dacă sunt actualizate
    if (updateData.tags && updateData.tags.length > 0) {
      for (const tagId of updateData.tags) {
        const tag = await tagModel.getTagById(tagId);
        if (!tag) {
          return res.status(404).json({
            success: false,
            message: `Tag-ul cu ID-ul ${tagId} nu există`
          });
        }
      }
    }
    
    await locationModel.updateLocation(locationId, updateData);
    
    const updatedLocation = await locationModel.getLocationById(locationId);
    
    res.json({
      success: true,
      message: 'Locație actualizată cu succes',
      data: updatedLocation
    });
  } catch (error) {
    console.error('Error in updateLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea locației',
      error: error.message
    });
  }
};

/**
 * @desc    Șterge o locație
 * @route   DELETE /api/locations/:id
 * @access  Private/Admin
 */
exports.deleteLocation = async (req, res) => {
  try {
    const locationId = req.params.id;
    
    const location = await locationModel.getLocationById(locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Locația nu a fost găsită'
      });
    }
    
    await locationModel.deleteLocation(locationId);
    
    res.json({
      success: true,
      message: 'Locație ștearsă cu succes',
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea locației',
      error: error.message
    });
  }
};

/**
 * @desc    Adaugă un tag la o locație
 * @route   POST /api/locations/:id/tags
 * @access  Private/Admin
 */
exports.addTagToLocation = async (req, res) => {
  try {
    const locationId = req.params.id;
    const { tagId } = req.body;
    
    if (!tagId) {
      return res.status(400).json({
        success: false,
        message: 'ID-ul tag-ului este obligatoriu'
      });
    }
    
    const location = await locationModel.getLocationById(locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Locația nu a fost găsită'
      });
    }
    
    const tag = await tagModel.getTagById(tagId);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag-ul nu a fost găsit'
      });
    }
    
    await locationModel.addTagToLocation(locationId, tagId);
    
    const updatedLocation = await locationModel.getLocationById(locationId);
    
    res.json({
      success: true,
      message: 'Tag adăugat cu succes la locație',
      data: updatedLocation
    });
  } catch (error) {
    console.error('Error in addTagToLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la adăugarea tag-ului la locație',
      error: error.message
    });
  }
};

/**
 * @desc    Elimină un tag de la o locație
 * @route   DELETE /api/locations/:id/tags/:tagId
 * @access  Private/Admin
 */
exports.removeTagFromLocation = async (req, res) => {
  try {
    const locationId = req.params.id;
    const { tagId } = req.params;
    
    const location = await locationModel.getLocationById(locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Locația nu a fost găsită'
      });
    }
    
    await locationModel.removeTagFromLocation(locationId, tagId);
    
    const updatedLocation = await locationModel.getLocationById(locationId);
    
    res.json({
      success: true,
      message: 'Tag eliminat cu succes de la locație',
      data: updatedLocation
    });
  } catch (error) {
    console.error('Error in removeTagFromLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la eliminarea tag-ului de la locație',
      error: error.message
    });
  }
};

/**
 * @desc    Obține locațiile după tag-uri
 * @route   GET /api/locations/tags
 * @access  Public
 */
exports.getLocationsByTags = async (req, res) => {
  try {
    const { tags } = req.query;
    
    if (!tags) {
      return res.status(400).json({
        success: false,
        message: 'Parametrul tags este obligatoriu'
      });
    }
    
    const tagIds = tags.split(',');
    
    const locations = await locationModel.getLocationsByTags(tagIds);
    
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Error in getLocationsByTags:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea locațiilor după tag-uri',
      error: error.message
    });
  }
};