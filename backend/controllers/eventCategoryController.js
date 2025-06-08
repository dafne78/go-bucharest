// /backend/controllers/eventCategoryController.js (actualizat pentru a permite tag-uri după nume)
const eventCategoryModel = require('../models/eventCategoryModel');
const tagModel = require('../models/tagModel');

/**
 * @desc    Creează o nouă categorie de eveniment
 * @route   POST /api/event-categories
 * @access  Private/Admin
 */
exports.createEventCategory = async (req, res) => {
  try {
    const { category_name, category_image, tags } = req.body;
    
    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: 'Numele categoriei este obligatoriu'
      });
    }
    
    // Array pentru a stoca ID-urile tag-urilor validate/create
    let validatedTagIds = [];
    
    // Verifică dacă tag-urile există, dacă sunt specificate
    if (tags && tags.length > 0) {
      // Pentru fiecare tag din array
      for (const tag of tags) {
        let tagId;
        let tagObject;
        
        // Verifică dacă tag-ul este un ID sau un nume
        if (typeof tag === 'string' && tag.length > 0) {
          // Încearcă să găsească tag-ul după ID
          tagObject = await tagModel.getTagById(tag);
          
          if (!tagObject) {
            // Dacă nu este găsit după ID, încearcă după nume
            tagObject = await tagModel.getTagByName(tag);
            
            if (!tagObject) {
              // Dacă nu există nici după nume, îl creăm
              console.log(`Creating new tag with name: ${tag}`);
              tagId = await tagModel.createTag({ name: tag });
              tagObject = { id: tagId, name: tag };
            }
          }
          
          // Adaugă ID-ul tag-ului validat la array
          validatedTagIds.push(tagObject.id);
        } else {
          return res.status(400).json({
            success: false,
            message: 'Fiecare tag trebuie să fie un string valid'
          });
        }
      }
    }
    
    console.log('Validated tag IDs:', validatedTagIds);
    
    // Creează categoria cu ID-urile tag-urilor validate
    const categoryId = await eventCategoryModel.createEventCategory({
      category_name,
      category_image,
      tags: validatedTagIds
    });
    
    const createdCategory = await eventCategoryModel.getEventCategoryById(categoryId);
    
    res.status(201).json({
      success: true,
      message: 'Categorie creată cu succes',
      data: createdCategory
    });
  } catch (error) {
    console.error('Error in createEventCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea categoriei',
      error: error.message
    });
  }
};

/**
 * @desc    Obține toate categoriile de evenimente
 * @route   GET /api/event-categories
 * @access  Public
 */
exports.getAllEventCategories = async (req, res) => {
  try {
    const categories = await eventCategoryModel.getAllEventCategories();
    
    // Obținem informații complete despre tag-uri pentru fiecare categorie
    const categoriesWithTagDetails = await Promise.all(
      categories.map(async (category) => {
        // Dacă categoria are tag-uri, obține detaliile lor
        if (category.tags && category.tags.length > 0) {
          const tagDetails = await Promise.all(
            category.tags.map(async (tagId) => {
              const tag = await tagModel.getTagById(tagId);
              return tag || { id: tagId, name: 'Tag necunoscut' };
            })
          );
          
          // Returnează categoria cu detalii despre tag-uri
          return {
            ...category,
            tagDetails
          };
        }
        
        // Dacă nu are tag-uri, returnează categoria așa cum este
        return category;
      })
    );
    
    res.json({
      success: true,
      count: categoriesWithTagDetails.length,
      data: categoriesWithTagDetails
    });
  } catch (error) {
    console.error('Error in getAllEventCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea categoriilor',
      error: error.message
    });
  }
};

/**
 * @desc    Obține o categorie de eveniment după ID
 * @route   GET /api/event-categories/:id
 * @access  Public
 */
exports.getEventCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await eventCategoryModel.getEventCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria nu a fost găsită'
      });
    }
    
    // Obține detaliile tag-urilor
    let tagDetails = [];
    
    if (category.tags && category.tags.length > 0) {
      tagDetails = await Promise.all(
        category.tags.map(async (tagId) => {
          const tag = await tagModel.getTagById(tagId);
          return tag || { id: tagId, name: 'Tag necunoscut' };
        })
      );
    }
    
    res.json({
      success: true,
      data: {
        ...category,
        tagDetails
      }
    });
  } catch (error) {
    console.error('Error in getEventCategoryById:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea categoriei',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizează o categorie de eveniment
 * @route   PUT /api/event-categories/:id
 * @access  Private/Admin
 */
exports.updateEventCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updateData = req.body;
    
    const category = await eventCategoryModel.getEventCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria nu a fost găsită'
      });
    }
    
    // Dacă sunt specificate tag-uri, procesează-le
    if (updateData.tags && updateData.tags.length > 0) {
      // Array pentru a stoca ID-urile tag-urilor validate
      let validatedTagIds = [];
      
      // Pentru fiecare tag din array
      for (const tag of updateData.tags) {
        let tagId;
        let tagObject;
        
        // Verifică dacă tag-ul este un ID sau un nume
        if (typeof tag === 'string' && tag.length > 0) {
          // Încearcă să găsească tag-ul după ID
          tagObject = await tagModel.getTagById(tag);
          
          if (!tagObject) {
            // Dacă nu este găsit după ID, încearcă după nume
            tagObject = await tagModel.getTagByName(tag);
            
            if (!tagObject) {
              // Dacă nu există nici după nume, îl creăm
              console.log(`Creating new tag with name: ${tag}`);
              tagId = await tagModel.createTag({ name: tag });
              tagObject = { id: tagId, name: tag };
            }
          }
          
          // Adaugă ID-ul tag-ului validat la array
          validatedTagIds.push(tagObject.id);
        } else {
          return res.status(400).json({
            success: false,
            message: 'Fiecare tag trebuie să fie un string valid'
          });
        }
      }
      
      // Înlocuiește tag-urile din datele de actualizare cu ID-urile validate
      updateData.tags = validatedTagIds;
    }
    
    await eventCategoryModel.updateEventCategory(categoryId, updateData);
    
    const updatedCategory = await eventCategoryModel.getEventCategoryById(categoryId);
    
    // Obține detaliile tag-urilor
    let tagDetails = [];
    
    if (updatedCategory.tags && updatedCategory.tags.length > 0) {
      tagDetails = await Promise.all(
        updatedCategory.tags.map(async (tagId) => {
          const tag = await tagModel.getTagById(tagId);
          return tag || { id: tagId, name: 'Tag necunoscut' };
        })
      );
    }
    
    res.json({
      success: true,
      message: 'Categorie actualizată cu succes',
      data: {
        ...updatedCategory,
        tagDetails
      }
    });
  } catch (error) {
    console.error('Error in updateEventCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea categoriei',
      error: error.message
    });
  }
};

/**
 * @desc    Șterge o categorie de eveniment
 * @route   DELETE /api/event-categories/:id
 * @access  Private/Admin
 */
exports.deleteEventCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const category = await eventCategoryModel.getEventCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria nu a fost găsită'
      });
    }
    
    await eventCategoryModel.deleteEventCategory(categoryId);
    
    res.json({
      success: true,
      message: 'Categorie ștearsă cu succes',
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteEventCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea categoriei',
      error: error.message
    });
  }
};

/**
 * @desc    Adaugă un tag la o categorie de eveniment
 * @route   POST /api/event-categories/:id/tags
 * @access  Private/Admin
 */
exports.addTagToEventCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { tagId, tagName } = req.body;
    
    if (!tagId && !tagName) {
      return res.status(400).json({
        success: false,
        message: 'ID-ul sau numele tag-ului este obligatoriu'
      });
    }
    
    const category = await eventCategoryModel.getEventCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria nu a fost găsită'
      });
    }
    
    let validatedTagId;
    
    // Dacă a fost specificat un ID
    if (tagId) {
      const tag = await tagModel.getTagById(tagId);
      
      if (!tag) {
        return res.status(404).json({
          success: false,
          message: 'Tag-ul nu a fost găsit'
        });
      }
      
      validatedTagId = tagId;
    }
    // Dacă a fost specificat un nume
    else if (tagName) {
      // Verifică dacă tag-ul există după nume
      let tag = await tagModel.getTagByName(tagName);
      
      if (!tag) {
        // Dacă nu există, îl creăm
        const newTagId = await tagModel.createTag({ name: tagName });
        validatedTagId = newTagId;
      } else {
        validatedTagId = tag.id;
      }
    }
    
    await eventCategoryModel.addTagToEventCategory(categoryId, validatedTagId);
    
    const updatedCategory = await eventCategoryModel.getEventCategoryById(categoryId);
    
    // Obține detaliile tag-urilor
    let tagDetails = [];
    
    if (updatedCategory.tags && updatedCategory.tags.length > 0) {
      tagDetails = await Promise.all(
        updatedCategory.tags.map(async (tagId) => {
          const tag = await tagModel.getTagById(tagId);
          return tag || { id: tagId, name: 'Tag necunoscut' };
        })
      );
    }
    
    res.json({
      success: true,
      message: 'Tag adăugat cu succes la categorie',
      data: {
        ...updatedCategory,
        tagDetails
      }
    });
  } catch (error) {
    console.error('Error in addTagToEventCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la adăugarea tag-ului la categorie',
      error: error.message
    });
  }
};

/**
 * @desc    Elimină un tag de la o categorie de eveniment
 * @route   DELETE /api/event-categories/:id/tags/:tagId
 * @access  Private/Admin
 */
exports.removeTagFromEventCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { tagId } = req.params;
    
    const category = await eventCategoryModel.getEventCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria nu a fost găsită'
      });
    }
    
    await eventCategoryModel.removeTagFromEventCategory(categoryId, tagId);
    
    const updatedCategory = await eventCategoryModel.getEventCategoryById(categoryId);
    
    // Obține detaliile tag-urilor
    let tagDetails = [];
    
    if (updatedCategory.tags && updatedCategory.tags.length > 0) {
      tagDetails = await Promise.all(
        updatedCategory.tags.map(async (tagId) => {
          const tag = await tagModel.getTagById(tagId);
          return tag || { id: tagId, name: 'Tag necunoscut' };
        })
      );
    }
    
    res.json({
      success: true,
      message: 'Tag eliminat cu succes de la categorie',
      data: {
        ...updatedCategory,
        tagDetails
      }
    });
  } catch (error) {
    console.error('Error in removeTagFromEventCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la eliminarea tag-ului de la categorie',
      error: error.message
    });
  }
};

/**
 * @desc    Obține categoriile după tag-uri
 * @route   GET /api/event-categories/tags
 * @access  Public
 */
exports.getEventCategoriesByTags = async (req, res) => {
  try {
    const { tags } = req.query;
    
    if (!tags) {
      return res.status(400).json({
        success: false,
        message: 'Parametrul tags este obligatoriu'
      });
    }
    
    // Split string-ul de tag-uri și procesează fiecare tag
    const tagArray = tags.split(',');
    const tagIds = [];
    
    // Pentru fiecare tag, verifică dacă este ID sau nume
    for (const tag of tagArray) {
      let tagId;
      
      // Verifică mai întâi dacă este un ID valid
      const tagById = await tagModel.getTagById(tag);
      if (tagById) {
        tagIds.push(tag);
      } else {
        // Dacă nu este un ID, verifică dacă este un nume valid
        const tagByName = await tagModel.getTagByName(tag);
        if (tagByName) {
          tagIds.push(tagByName.id);
        }
        // Ignoră tag-urile care nu există
      }
    }
    
    // Dacă nu s-a găsit niciun tag valid
    if (tagIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    const categories = await eventCategoryModel.getEventCategoriesByTags(tagIds);
    
    // Obținem informații complete despre tag-uri pentru fiecare categorie
    const categoriesWithTagDetails = await Promise.all(
      categories.map(async (category) => {
        // Dacă categoria are tag-uri, obține detaliile lor
        if (category.tags && category.tags.length > 0) {
          const tagDetails = await Promise.all(
            category.tags.map(async (tagId) => {
              const tag = await tagModel.getTagById(tagId);
              return tag || { id: tagId, name: 'Tag necunoscut' };
            })
          );
          
          // Returnează categoria cu detalii despre tag-uri
          return {
            ...category,
            tagDetails
          };
        }
        
        // Dacă nu are tag-uri, returnează categoria așa cum este
        return category;
      })
    );
    
    res.json({
      success: true,
      count: categoriesWithTagDetails.length,
      data: categoriesWithTagDetails
    });
  } catch (error) {
    console.error('Error in getEventCategoriesByTags:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea categoriilor după tag-uri',
      error: error.message
    });
  }
};