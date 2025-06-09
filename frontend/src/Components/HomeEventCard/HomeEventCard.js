import React from 'react';
import { Link } from 'react-router-dom';
import './HomeEventCard.css';

const HomeEventCard = ({ event }) => {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return dateString;
    }
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.grade, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="home-event-card">
      <div className="home-event-image-container">
        {event.image ? (
          <img src={event.image} alt={event.name} className="home-event-image" />
        ) : (
          <div className="home-event-no-image">
            <span>🖼️</span>
          </div>
        )}
        <div className="home-event-date">
          {formatDate(event.date)}
        </div>
      </div>
      
      <div className="home-event-content">
        <h3 className="home-event-title">{event.name}</h3>
        
        <div className="home-event-meta">
          <div className="home-event-location">
            <span>📍</span>
            {event.zoneDetails ? event.zoneDetails.name : event.location?.zone}
          </div>
          <div className="home-event-rating">
            <span>⭐</span>
            {getAverageRating(event.reviews)}
          </div>
        </div>

        <div className="home-event-categories">
          {event.categoryDetails?.slice(0, 2).map((category, index) => (
            <span key={index} className="home-event-category">
              {category.category_name || category.name}
            </span>
          ))}
        </div>

        <Link to={`/events/${event._id}`} className="home-event-link">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default HomeEventCard; 