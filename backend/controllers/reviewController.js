// /backend/controllers/reviewController.js
const reviewModel = require('../models/reviewModel');
const eventModel = require('../models/eventModel');

/**
 * @desc    Creează o nouă recenzie
 * @route   POST /api/reviews
 * @access  Private
 */
exports.createReview = async (req, res) => {
  try {
    const { eventId, grade, reviewText } = req.body;
    
    // Validare date obligatorii
    if (!eventId || !grade) {
      return res.status(400).json({
        success: false,
        message: 'ID-ul evenimentului și nota sunt obligatorii'
      });
    }
    
    // Verifică dacă evenimentul există
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
    const existingReviews = await reviewModel.getReviewsByEvent(eventId);
    const existingReview = existingReviews.find(review => review.userId === userId);
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ați adăugat deja o recenzie la acest eveniment'
      });
    }
    
    // Crează recenzia
    const reviewId = await reviewModel.createReview({
      userId,
      userName,
      profilePicture,
      eventId,
      grade,
      reviewText
    });
    
    // Obține recenzia creată
    const createdReview = await reviewModel.getReviewById(reviewId);
    
    res.status(201).json({
      success: true,
      message: 'Recenzie adăugată cu succes',
      data: createdReview
    });
  } catch (error) {
    console.error('Error in createReview:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea recenziei',
      error: error.message
    });
  }
};

/**
 * @desc    Obține toate recenziile
 * @route   GET /api/reviews
 * @access  Public
 */
exports.getAllReviews = async (req, res) => {
  try {
    const { userId, eventId, minGrade, maxGrade, sortBy, sortOrder, limit } = req.query;
    
    const filters = {};
    
    if (userId) filters.userId = userId;
    if (eventId) filters.eventId = eventId;
    if (minGrade) filters.minGrade = parseFloat(minGrade);
    if (maxGrade) filters.maxGrade = parseFloat(maxGrade);
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder;
    if (limit) filters.limit = parseInt(limit);
    
    const reviews = await reviewModel.getAllReviews(filters);
    
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error in getAllReviews:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea recenziilor',
      error: error.message
    });
  }
};

/**
 * @desc    Obține o recenzie după ID
 * @route   GET /api/reviews/:id
 * @access  Public
 */
exports.getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await reviewModel.getReviewById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Recenzia nu a fost găsită'
      });
    }
    
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error in getReviewById:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea recenziei',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizează o recenzie
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { grade, reviewText } = req.body;
    
    // Validare date obligatorii
    if (!grade) {
      return res.status(400).json({
        success: false,
        message: 'Nota este obligatorie'
      });
    }
    
    const review = await reviewModel.getReviewById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Recenzia nu a fost găsită'
      });
    }
    
    // Verifică dacă utilizatorul este autorul recenziei
    const userId = req.user.uid;
    const userRole = req.user.role;
    
    if (review.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a actualiza această recenzie'
      });
    }
    
    await reviewModel.updateReview(reviewId, {
      grade,
      reviewText,
      updatedAt: new Date().toISOString()
    });
    
    // Obține recenzia actualizată
    const updatedReview = await reviewModel.getReviewById(reviewId);
    
    res.json({
      success: true,
      message: 'Recenzie actualizată cu succes',
      data: updatedReview
    });
  } catch (error) {
    console.error('Error in updateReview:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea recenziei',
      error: error.message
    });
  }
};

/**
 * @desc    Șterge o recenzie
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const review = await reviewModel.getReviewById(reviewId);
    
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
    
    await reviewModel.deleteReview(reviewId);
    
    res.json({
      success: true,
      message: 'Recenzie ștearsă cu succes',
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteReview:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea recenziei',
      error: error.message
    });
  }
};

/**
 * @desc    Obține recenziile unui utilizator
 * @route   GET /api/reviews/user
 * @access  Private
 */
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const reviews = await reviewModel.getReviewsByUser(userId);
    
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error in getUserReviews:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea recenziilor utilizatorului',
      error: error.message
    });
  }
};

/**
 * @desc    Obține recenziile unui eveniment
 * @route   GET /api/reviews/event/:eventId
 * @access  Public
 */
exports.getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Verifică dacă evenimentul există
    const event = await eventModel.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evenimentul nu a fost găsit'
      });
    }
    
    const reviews = await reviewModel.getReviewsByEvent(eventId);
    
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error in getEventReviews:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea recenziilor evenimentului',
      error: error.message
    });
  }
};

/**
 * @desc    Obține nota medie pentru un eveniment
 * @route   GET /api/reviews/event/:eventId/average
 * @access  Public
 */
exports.getEventAverageGrade = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Verifică dacă evenimentul există
    const event = await eventModel.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evenimentul nu a fost găsit'
      });
    }
    
    const averageGrade = await reviewModel.getAverageGradeForEvent(eventId);
    
    res.json({
      success: true,
      data: {
        eventId,
        averageGrade,
        reviewCount: event.reviews ? event.reviews.length : 0
      }
    });
  } catch (error) {
    console.error('Error in getEventAverageGrade:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la calcularea notei medii a evenimentului',
      error: error.message
    });
  }
};

module.exports = exports;