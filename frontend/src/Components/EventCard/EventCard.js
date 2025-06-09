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
      <div className="event-card-main">
        <div className="event-card-img-wrapper">
          {event.image ? (
            <img src={event.image} alt={event.name} className="event-card-img" />
          ) : (
            <div className="event-card-no-img">
              <span className="event-card-no-img-icon">🖼️</span>
              <span className="event-card-no-img-text">No Image</span>
            </div>
          )}
        </div>
      
        <div className="event-card-content">
          <h3 className="event-card-title">{event.name}</h3>

          <div className="event-card-meta">
            <div className="event-card-meta-item">
              <span className="event-card-meta-icon">💰</span>
              <span className="event-card-meta-text">
                {event.cost && event.cost > 0 ? `${event.cost} RON` : 'Free Entry'}
              </span>
            </div>

            <div className="event-card-meta-item">
              <span className="event-card-meta-icon">⭐</span>
              <span className="event-card-meta-text">
                {getAverageRating(event.reviews)} ({event.reviews?.length || 0})
              </span>
            </div>
          </div>

          <div className="event-card-details">
            <div className="event-card-meta-item">
              <span className="event-card-meta-icon">📅</span>
              <span className="event-card-meta-text">{formatDate(event.date)}</span>
            </div>
            
            <div className="event-card-meta-item">
              <span className="event-card-meta-icon">📍</span>
              <span className="event-card-meta-text">
                {event.zoneDetails ? event.zoneDetails.name : capitalize(event.location?.zone)}
              </span>
            </div>
          </div>

          {event.description && (
            <p className="event-card-description">
              {event.description.substring(0, 100)}...
            </p>
          )}

          {event.categoryDetails && event.categoryDetails.length > 0 && (
            <div className="event-card-categories">
              {event.categoryDetails.map((category, index) => (
                <span key={index} className="event-card-category">
                  {category.category_name || category.name}
                </span>
              ))}
            </div>
          )}

          <div className="event-card-actions">
            <Link to={`/events/${event._id}`} className="event-card-link">
              View Details
            </Link>
            <button 
              className="event-card-button"
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
