// /backend/controllers/tagController.js
const tagModel = require('../models/tagModel');

/**
 * @desc    Creează un nou tag
 * @route   POST /api/tags
 * @access  Private/Admin
 */
exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Numele tag-ului este obligatoriu'
      });
    }
    
    const tagId = await tagModel.createTag({ name });
    
    // Get the created tag to return complete data
    const createdTag = await tagModel.getTagById(tagId);
    
    res.status(201).json({
      success: true,
      message: 'Tag creat cu succes',
      data: createdTag
    });
  } catch (error) {
    console.error('Error in createTag:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea tag-ului',
      error: error.message
    });
  }
};

/**
 * @desc    Obține toate tag-urile
 * @route   GET /api/tags
 * @access  Public
 */
exports.getAllTags = async (req, res) => {
  try {
    const tags = await tagModel.getAllTags();
    
    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    console.error('Error in getAllTags:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea tag-urilor',
      error: error.message
    });
  }
};

/**
 * @desc    Obține un tag după ID
 * @route   GET /api/tags/:id
 * @access  Public
 */
exports.getTagById = async (req, res) => {
  try {
    const tagId = req.params.id;
    const tag = await tagModel.getTagById(tagId);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag-ul nu a fost găsit'
      });
    }
    
    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Error in getTagById:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea tag-ului',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizează un tag
 * @route   PUT /api/tags/:id
 * @access  Private/Admin
 */
exports.updateTag = async (req, res) => {
  try {
    const tagId = req.params.id;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Numele tag-ului este obligatoriu'
      });
    }
    
    const tag = await tagModel.getTagById(tagId);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag-ul nu a fost găsit'
      });
    }
    
    await tagModel.updateTag(tagId, { name });
    
    // Get the updated tag to return complete data
    const updatedTag = await tagModel.getTagById(tagId);
    
    res.json({
      success: true,
      message: 'Tag actualizat cu succes',
      data: updatedTag
    });
  } catch (error) {
    console.error('Error in updateTag:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea tag-ului',
      error: error.message
    });
  }
};

/**
 * @desc    Șterge un tag
 * @route   DELETE /api/tags/:id
 * @access  Private/Admin
 */
exports.deleteTag = async (req, res) => {
  try {
    const tagId = req.params.id;
    
    const tag = await tagModel.getTagById(tagId);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag-ul nu a fost găsit'
      });
    }
    
    await tagModel.deleteTag(tagId);
    
    res.json({
      success: true,
      message: 'Tag șters cu succes',
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteTag:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea tag-ului',
      error: error.message
    });
  }
};