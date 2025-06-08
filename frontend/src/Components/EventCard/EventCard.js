import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
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

  return (
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
          <button className="event-book-button">Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
