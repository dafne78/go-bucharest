const { db } = require('../config/firebase');

class Booking {
  constructor(data = {}) {
    this.eventId = data.eventId || '';
    this.userId = data.userId || '';
    this.status = data.status || 'confirmed'; // Default to confirmed since there are no tickets
    this.bookingDate = data.bookingDate || new Date();
  }

  static async create(bookingData) {
    try {
      const booking = new Booking(bookingData);
      const bookingRef = await db.collection('bookings').add({
        ...booking,
        bookingDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: bookingRef.id, ...booking };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  static async findById(bookingId) {
    try {
      const bookingDoc = await db.collection('bookings').doc(bookingId).get();
      if (!bookingDoc.exists) {
        return null;
      }
      return { id: bookingDoc.id, ...bookingDoc.data() };
    } catch (error) {
      console.error('Error finding booking:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const bookingsSnapshot = await db.collection('bookings')
        .where('userId', '==', userId)
        .orderBy('bookingDate', 'desc')
        .get();

      return bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error finding user bookings:', error);
      throw error;
    }
  }

  static async findByEventId(eventId) {
    try {
      const bookingsSnapshot = await db.collection('bookings')
        .where('eventId', '==', eventId)
        .orderBy('bookingDate', 'desc')
        .get();

      return bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error finding event bookings:', error);
      throw error;
    }
  }

  static async update(bookingId, updateData) {
    try {
      const bookingRef = db.collection('bookings').doc(bookingId);
      await bookingRef.update({
        ...updateData,
        updatedAt: new Date()
      });
      return { id: bookingId, ...updateData };
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  static async delete(bookingId) {
    try {
      await db.collection('bookings').doc(bookingId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }
}

module.exports = Booking; 