const bookingModel = require('../models/bookingModel');
const eventModel = require('../models/eventModel');
const userModel = require('../models/userModel');

/**
 * @desc    Creează o nouă înregistrare la eveniment
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.uid;

    // Verifică dacă evenimentul există
    const event = await eventModel.getEventById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evenimentul nu a fost găsit'
      });
    }

    // Verifică dacă utilizatorul este deja înregistrat
    const existingBookings = await bookingModel.findByEventId(eventId);
    const isAlreadyRegistered = existingBookings.some(booking => 
      booking.userId === userId && booking.status === 'confirmed'
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Sunteți deja înregistrat la acest eveniment'
      });
    }

    // Obține profilul utilizatorului
    const userProfile = await userModel.getUserById(userId);
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profilul utilizatorului nu a fost găsit'
      });
    }

    // Creează booking-ul
    const booking = await bookingModel.create({
      userId,
      eventId,
      status: 'confirmed'
    });

    // Adaugă participantul la eveniment
    await eventModel.addParticipantToEvent(eventId, {
      userId,
      userName: userProfile.name,
      userEmail: userProfile.email
    });

    res.status(201).json({
      success: true,
      message: 'Înregistrare la eveniment reușită',
      data: {
        bookingId: booking.id,
        eventId,
        userId,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Eroare la crearea înregistrării',
      error: error.message
    });
  }
};

/**
 * @desc    Obține toate evenimentele la care participă utilizatorul
 * @route   GET /api/bookings/user
 * @access  Private
 */
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.uid;
    const bookings = await bookingModel.findByUserId(userId);
    
    // Pentru fiecare booking, obține și detaliile evenimentului
    const bookingsWithEventDetails = await Promise.all(
      bookings.map(async (booking) => {
        const event = await eventModel.getEventById(booking.eventId);
        return {
          ...booking,
          event: event || null
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: bookingsWithEventDetails,
      count: bookingsWithEventDetails.length
    });
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea înregistrărilor',
      error: error.message
    });
  }
};

/**
 * @desc    Obține toți participanții la un eveniment
 * @route   GET /api/bookings/event/:eventId/participants
 * @access  Private
 */
const getEventParticipants = async (req, res) => {
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
    
    // Obține toate booking-urile pentru acest eveniment
    const bookings = await bookingModel.findByEventId(eventId);
    
    // Filtrează doar booking-urile confirmate
    const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
    
    // Obține detaliile participanților din array-ul participants al evenimentului
    const participants = event.participants || [];
    
    res.status(200).json({
      success: true,
      data: participants,
      count: participants.length
    });
  } catch (error) {
    console.error('Error in getEventParticipants:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea participanților',
      error: error.message
    });
  }
};

/**
 * @desc    Anulează participarea la un eveniment
 * @route   DELETE /api/bookings/:bookingId
 * @access  Private
 */
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.uid;

    // Verifică dacă înregistrarea există și aparține utilizatorului
    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Înregistrarea nu a fost găsită'
      });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a anula această înregistrare'
      });
    }

    // Șterge booking-ul
    await bookingModel.delete(bookingId);

    // Elimină participantul din eveniment
    await eventModel.removeParticipantFromEvent(booking.eventId, userId);

    res.status(200).json({
      success: true,
      message: 'Participarea la eveniment a fost anulată cu succes'
    });
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la anularea participării',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getEventParticipants,
  cancelBooking
};