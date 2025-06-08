import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import authService from '../../services/authService';
import Notification from '../Notification/Notification';
import './EventCard.css';

const EventCard = ({ event }) => {
  const [isBooking, setIsBooking] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.grade, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const handleBooking = async () => {
    if (!authService.isAuthenticated()) {
      if (window.confirm('You need to be logged in to book an event. Would you like to log in now?')) {
        navigate('/login');
      }
      return;
    }

    try {
      setIsBooking(true);
      
      const response = await apiService.post('/bookings/add', {
        eventId: event._id
      });

      if (response.success) {
        showNotification('Booking successful! You are now registered for this event.', 'success');
      } else {
        throw new Error(response.message || 'Failed to book event');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    <div className="event-card">
        {event.image ? (
      <img src={event.image} alt={event.name} className="event-image" />
        ) : (
          <div className="no-image-placeholder">
            <span className="no-image-emoji">🖼️</span>
            <span className="no-image-text">No Image</span>
          </div>
        )}
      
      <div className="event-info">
        <h3 className="event-name">{event.name}</h3>

          <div className="event-meta">
            <div className="meta-item">
              <span className="meta-emoji">💰</span>
              <span className="meta-value">
                {event.cost && event.cost > 0 ? `${event.cost} RON` : 'Free Entry'}
              </span>
            </div>

            <div className="meta-item">
              <span className="meta-emoji">⭐</span>
              <span className="meta-value">
                {getAverageRating(event.reviews)} ({event.reviews?.length || 0})
          </span>
            </div>
        </div>

          <div className="event-datetime-location">
            <div className="meta-item">
              <span className="meta-emoji">📅</span>
              <span className="meta-value">{formatDate(event.date)}</span>
            </div>
            
            <div className="meta-item">
              <span className="meta-emoji">📍</span>
              <span className="meta-value">
                {event.zoneDetails ? event.zoneDetails.name : capitalize(event.location?.zone)}
              </span>
            </div>
          </div>

          {event.description && (
        <p className="event-description">
          {event.description.substring(0, 100)}...
        </p>
          )}

          {event.categoryDetails && event.categoryDetails.length > 0 && (
            <div className="event-categories">
              {event.categoryDetails.map((category, index) => (
                <span key={index} className="category-tag">
                  {category.category_name || category.name}
                </span>
              ))}
            </div>
          )}

        <div className="event-actions">
          <Link to={`/events/${event._id}`} className="event-details-link">
            View Details
          </Link>
            <button 
              className="event-book-button"
              onClick={handleBooking}
              disabled={isBooking}
            >
              {isBooking ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventCard;
