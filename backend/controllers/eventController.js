// /backend/controllers/eventController.js
const eventModel = require('../models/eventModel');
const locationZoneModel = require('../models/locationZoneModel');
const eventCategoryModel = require('../models/eventCategoryModel');

/**
 * @desc    Creează un nou eveniment
 * @route   POST /api/events
 * @access  Private
 */
exports.createEvent = async (req, res) => {
  try {
    const { 
      name, 
      image, 
      cost, 
      description, 
      categories, 
      date, 
      time,
      location
    } = req.body;
    
    // Validare date obligatorii
    if (!name || !date || !time || !location || !location.zone) {
      return res.status(400).json({
        success: false,
        message: 'Numele, data, ora și zona sunt obligatorii'
      });
    }
    
    let processedLocation = { ...location };

    // Verifică dacă zona este specificată ca nume sau ID
    if (location.zone && typeof location.zone === 'string') {
      // Verifică dacă zona există ca ID
      let zone = await locationZoneModel.getLocationZoneById(location.zone);
      
      if (!zone) {
        // Dacă nu este un ID, verifică dacă este un nume valid
        zone = await locationZoneModel.getLocationZoneByName(location.zone);
        
        if (!zone) {
          return res.status(404).json({
            success: false,
            message: `Zona specificată '${location.zone}' nu există`
          });
        }
        
        // Actualizează zona cu ID-ul corect
        processedLocation.zone = zone.id;
      }
    }
    
    // Procesează categoriile
    let processedCategories = [];

    if (categories && categories.length > 0) {
      // Pentru fiecare categorie
      for (const category of categories) {
        let categoryId;
        
        // Verifică dacă categoria este un ID sau un nume
        if (typeof category === 'string') {
          // Încearcă să găsească categoria după ID
          let categoryObj = await eventCategoryModel.getEventCategoryById(category);
          
          if (categoryObj) {
            categoryId = category;
          } else {
            // Încearcă să găsească categoria după nume
            categoryObj = await eventCategoryModel.getEventCategoryByName(category);
            
            if (categoryObj) {
              categoryId = categoryObj.id;
            } else {
              // Opțional: creează automat categoria
              const newCategory = await eventCategoryModel.getOrCreateEventCategoryByName(category);
              categoryId = newCategory.id;
            }
          }
          
          processedCategories.push(categoryId);
        }
      }
    }

    
    // Adăugă ID-ul utilizatorului care creează evenimentul
    const userId = req.user.uid;
    
    const eventId = await eventModel.createEvent({
      name,
      image,
      cost,
      description,
      categories,
      date,
      time,
      location,
      userId
    });
    
    const createdEvent = await eventModel.getEventById(eventId);
    
    res.status(201).json({
      success: true,
      message: 'Eveniment creat cu succes',
      data: createdEvent
    });
  } catch (error) {
    console.error('Error in createEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea evenimentului',
      error: error.message
    });
  }
};

/**
 * @desc    Obține toate evenimentele
 * @route   GET /api/events
 * @access  Public
 */
/**
 * @desc    Obține toate evenimentele
 * @route   GET /api/events
 * @access  Public
 */
exports.getAllEvents = async (req, res) => {
  try {
    const { 
      category, 
      zone, 
      date, 
      minCost, 
      maxCost, 
      sortBy, 
      sortOrder,
      limit,
      tag
    } = req.query;
    
    const filters = {};
    
    // Procesare filtru categorie (acceptă ID sau nume)
    if (category) {
      // Verifică dacă categoria este un ID valid
      let categoryObj = await eventCategoryModel.getEventCategoryById(category);
      
      if (categoryObj) {
        filters.category = category;
      } else {
        // Verifică dacă categoria este un nume valid
        categoryObj = await eventCategoryModel.getEventCategoryByName(category);
        
        if (categoryObj) {
          filters.category = categoryObj.id;
        } else {
          // Dacă categoria nu există, returnează array gol
          return res.json({
            success: true,
            count: 0,
            data: []
          });
        }
      }
    }
    
    // Procesare filtru zonă (acceptă ID sau nume)
    if (zone) {
      // Verifică dacă zona este un ID valid
      let zoneObj = await locationZoneModel.getLocationZoneById(zone);
      
      if (zoneObj) {
        filters.zone = zone;
      } else {
        // Verifică dacă zona este un nume valid
        zoneObj = await locationZoneModel.getLocationZoneByName(zone);
        
        if (zoneObj) {
          filters.zone = zoneObj.id;
        } else {
          // Dacă zona nu există, returnează array gol
          return res.json({
            success: true,
            count: 0,
            data: []
          });
        }
      }
    }
    
    // Procesare filtru tag (acceptă ID sau nume)
    if (tag) {
      // Verifică dacă tag-ul este un ID valid
      let tagObj = await tagModel.getTagById(tag);
      
      if (tagObj) {
        filters.tag = tag;
      } else {
        // Verifică dacă tag-ul este un nume valid
        tagObj = await tagModel.getTagByName(tag);
        
        if (tagObj) {
          filters.tag = tagObj.id;
        } else {
          // Dacă tag-ul nu există, returnează array gol
          return res.json({
            success: true,
            count: 0,
            data: []
          });
        }
      }
    }
    
    if (date) filters.date = date;
    if (minCost) filters.minCost = parseFloat(minCost);
    if (maxCost) filters.maxCost = parseFloat(maxCost);
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder;
    if (limit) filters.limit = limit;
    
    const events = await eventModel.getAllEvents(filters);
    
    // ADĂUGAȚI AICI SECȚIUNEA DE COD PENTRU DETALII SUPLIMENTARE
    // Obține informații suplimentare pentru fiecare eveniment
    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        // Obține detalii despre categorii
        const categoryDetails = [];
        if (event.categories && event.categories.length > 0) {
          for (const catId of event.categories) {
            const category = await eventCategoryModel.getEventCategoryById(catId);
            if (category) {
              categoryDetails.push(category);
            }
          }
        }
        
        // Obține detalii despre zona de locație
        let zoneDetails = null;
        if (event.location && event.location.zone) {
          zoneDetails = await locationZoneModel.getLocationZoneById(event.location.zone);
        }
        
        // Îmbogățește obiectul eveniment cu detalii
        return {
          ...event,
          categoryDetails,
          zoneDetails
        };
      })
    );
    
    // Modificați această parte pentru a returna eventsWithDetails în loc de events
    res.json({
      success: true,
      count: eventsWithDetails.length,
      data: eventsWithDetails
    });
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea evenimentelor',
      error: error.message
    });
  }
};

/**
 * @desc    Obține un eveniment după ID
 * @route   GET /api/events/:id
 * @access  Public
 */
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await eventModel.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evenimentul nu a fost găsit'
      });
    }
    
    // Adăugă detalii suplimentare
    const categoryDetails = [];
    if (event.categories && event.categories.length > 0) {
      for (const catId of event.categories) {
        const category = await eventCategoryModel.getEventCategoryById(catId);
        if (category) {
          categoryDetails.push(category);
        }
      }
    }
    
    let zoneDetails = null;
    if (event.location && event.location.zone) {
      zoneDetails = await locationZoneModel.getLocationZoneById(event.location.zone);
    }
    
    const eventWithDetails = {
      ...event,
      categoryDetails,
      zoneDetails
    };
    
    res.json({
      success: true,
      data: eventWithDetails
    });
  } catch (error) {
    console.error('Error in getEventById:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea evenimentului',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizează un eveniment
 * @route   PUT /api/events/:id
 * @access  Private
 */
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;
    
    const event = await eventModel.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evenimentul nu a fost găsit'
      });
    }
    
    // Verifică dacă utilizatorul este creatorul evenimentului sau admin
    const userId = req.user.uid;
    const userRole = req.user.role;
    
    if (event.createdBy !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a actualiza acest eveniment'
      });
    }
    
    // Verifică dacă zona există, dacă este actualizată
    if (updateData.location && updateData.location.zone) {
      const zone = await locationZoneModel.getLocationZoneById(updateData.location.zone);
      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zona specificată nu există'
        });
      }
    }
    
    // Verifică dacă categoriile există, dacă sunt actualizate
    if (updateData.categories && updateData.categories.length > 0) {
      for (const categoryId of updateData.categories) {
        const category = await eventCategoryModel.getEventCategoryById(categoryId);
        if (!category) {
          return res.status(404).json({
            success: false,
            message: `Categoria cu ID-ul ${categoryId} nu există`
          });
        }
      }
    }
    
    await eventModel.updateEvent(eventId, updateData);
    
    const updatedEvent = await eventModel.getEventById(eventId);
    
    res.json({
      success: true,
      message: 'Eveniment actualizat cu succes',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea evenimentului',
      error: error.message
    });
  }
};

/**
 * @desc    Șterge un eveniment
 * @route   DELETE /api/events/:id
 * @access  Private
 */
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const event = await eventModel.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evenimentul nu a fost găsit'
      });
    }
    
    // Verifică dacă utilizatorul este creatorul evenimentului sau admin
    const userId = req.user.uid;
    const userRole = req.user.role;
    
    if (event.createdBy !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a șterge acest eveniment'
      });
    }
    
    await eventModel.deleteEvent(eventId);
    
    res.json({
      success: true,
      message: 'Eveniment șters cu succes',
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea evenimentului',
      error: error.message
    });
  }
};

/**
 * @desc    Adaugă o categorie la un eveniment
 * @route   POST /api/events/:id/categories
 * @access  Private
 */
exports.addCategoryToEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { categoryId } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'ID-ul categoriei este obligatoriu'
      });
    }
    
    const event = await eventModel.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evenimentul nu a fost găsit'
      });
    }
    
    // Verifică dacă utilizatorul este creatorul evenimentului sau admin
    const userId = req.user.uid;
    const userRole = req.user.role;
    
    if (event.createdBy !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a actualiza acest eveniment'
      });
    }
    
    const category = await eventCategoryModel.getEventCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria nu a fost găsită'
      });
    }
    
    await eventModel.addCategoryToEvent(eventId, categoryId);
    
    const updatedEvent = await eventModel.getEventById(eventId);
    
    res.json({
      success: true,
      message: 'Categorie adăugată cu succes la eveniment',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error in addCategoryToEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la adăugarea categoriei la eveniment',
      error: error.message
    });
  }
};

/**
 * @desc    Elimină o categorie de la un eveniment
 * @route   DELETE /api/events/:id/categories/:categoryId
 * @access  Private
 */
exports.removeCategoryFromEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { categoryId } = req.params;
    
    const event = await eventModel.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evenimentul nu a fost găsit'
      });
    }
    
    // Verifică dacă utilizatorul este creatorul evenimentului sau admin
    const userId = req.user.uid;
    const userRole = req.user.role;
    
    if (event.createdBy !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a actualiza acest eveniment'
      });
    }
    
    await eventModel.removeCategoryFromEvent(eventId, categoryId);
    
    const updatedEvent = await eventModel.getEventById(eventId);
    
    res.json({
      success: true,
      message: 'Categorie eliminată cu succes de la eveniment',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error in removeCategoryFromEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la eliminarea categoriei de la eveniment',
      error: error.message
    });
  }
};

/**
 * @desc    Adaugă o recenzie la un eveniment
 * @route   POST /api/events/:id/reviews
 * @access  Private
 */
exports.addReviewToEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { grade, reviewText } = req.body;
    
    if (!grade) {
      return res.status(400).json({
        success: false,
        message: 'Nota este obligatorie'
      });
    }
    
    const event = await eventModel.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evenimentul nu a fost găsit'
      });
    }
    
    // Obține datele utilizatorului
    const userId = req.user.uid;
    const userName = req.user.name || 'Utilizator';
    const profilePicture = req.user.profilePicture || null;
    
    // Verifică dacă utilizatorul a mai adăugat o recenzie la acest eveniment
    const existingReview = event.reviews.find(review => review.userId === userId);
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ați adăugat deja o recenzie la acest eveniment'
      });
    }
    
    const reviewId = await eventModel.addReviewToEvent(eventId, {
      userId,
      userName,
      profilePicture,
      grade,
      reviewText
    });
    
    const updatedEvent = await eventModel.getEventById(eventId);
    
    res.status(201).json({
      success: true,
      message: 'Recenzie adăugată cu succes',
      data: updatedEvent.reviews.find(review => review.id === reviewId)
    });
  } catch (error) {
    console.error('Error in addReviewToEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la adăugarea recenziei',
      error: error.message
    });
  }
};

/**
 * @desc    Elimină o recenzie de la un eveniment
 * @route   DELETE /api/events/:id/reviews/:reviewId
 * @access  Private
 */
exports.removeReviewFromEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { reviewId } = req.params;
    
    const event = await eventModel.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evenimentul nu a fost găsit'
      });
    }
    
    // Găsește recenzia
    const review = event.reviews.find(r => r.id === reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Recenzia nu a fost găsită'
      });
    }
    
    // Verifică dacă utilizatorul este autorul recenziei sau admin
    const userId = req.user.uid;
    const userRole = req.user.role;
    
    if (review.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a șterge această recenzie'
      });
    }
    
    await eventModel.removeReviewFromEvent(eventId, reviewId);
    
    res.json({
      success: true,
      message: 'Recenzie eliminată cu succes',
      data: {}
    });
  } catch (error) {
    console.error('Error in removeReviewFromEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la eliminarea recenziei',
      error: error.message
    });
  }
};

/**
 * @desc    Obține evenimente după categorii
 * @route   GET /api/events/categories
 * @access  Public
 */
exports.getEventsByCategories = async (req, res) => {
  try {
    const { categories } = req.query;
    
    if (!categories) {
      return res.status(400).json({
        success: false,
        message: 'Parametrul categories este obligatoriu'
      });
    }
    
    const categoryIds = categories.split(',');
    
    const events = await eventModel.getEventsByCategories(categoryIds);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error in getEventsByCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea evenimentelor după categorii',
      error: error.message
    });
  }
};

/**
 * @desc    Obține evenimente după zonă
 * @route   GET /api/events/zones/:zone
 * @access  Public
 */
exports.getEventsByZone = async (req, res) => {
  try {
    const { zone } = req.params;
    
    const events = await eventModel.getEventsByZone(zone);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error in getEventsByZone:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea evenimentelor după zonă',
      error: error.message
    });
  }
};

/**
 * @desc    Obține evenimente după interval de cost
 * @route   GET /api/events/cost
 * @access  Public
 */
exports.getEventsByCostRange = async (req, res) => {
  try {
    const { minCost, maxCost } = req.query;
    
    const events = await eventModel.getEventsByCostRange(
      minCost ? parseFloat(minCost) : undefined,
      maxCost ? parseFloat(maxCost) : undefined
    );
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error in getEventsByCostRange:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea evenimentelor după cost',
      error: error.message
    });
  }
};

/**
 * @desc    Obține evenimente viitoare
 * @route   GET /api/events/upcoming
 * @access  Public
 */
exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await eventModel.getUpcomingEvents();
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error in getUpcomingEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea evenimentelor viitoare',
      error: error.message
    });
  }
};

/**
 * @desc    Obține evenimentele utilizatorului curent
 * @route   GET /api/events/user
 * @access  Private
 */
exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const events = await eventModel.getEventsByUser(userId);
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error in getUserEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea evenimentelor utilizatorului',
      error: error.message
    });
  }
};

module.exports = exports;
