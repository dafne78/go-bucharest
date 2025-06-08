// /src/components/event/EventDetails/EventDetails.js
import React, { useState, useEffect } from 'react';
import eventService from '../../../services/eventsService';
import './EventDetails.css';

const EventDetails = ({ eventId, onClose, onEdit }) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventService.getEventById(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError('Could not load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (eventDate) => {
    const currentDate = new Date().toISOString().split('T')[0];
    return eventDate > currentDate ? 'upcoming' : 'completed';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  const renderStars = (grade) => {
    const stars = [];
    const fullStars = Math.floor(grade);
    const hasHalfStar = grade % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    
    return stars.join('');
  };

  if (loading) {
    return (
      <div className="event-detail">
        <div className="detail-header">
          <h2>
            <span className="header-emoji">🎉</span>
            Event Details
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-detail">
        <div className="detail-header">
          <h2>
            <span className="header-emoji">🎉</span>
            Event Details
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="error-container">
          <span className="error-emoji">❌</span>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchEventDetails}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail">
        <div className="detail-header">
          <h2>
            <span className="header-emoji">🎉</span>
            Event Details
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="error-container">
          <span className="error-emoji">📭</span>
          <p>Event not found.</p>
        </div>
      </div>
    );
  }

  const status = getEventStatus(event.date);

  return (
    <div className="event-detail">
      <div className="detail-header">
        <h2>
          <span className="header-emoji">🎉</span>
          Event Details
        </h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="event-detail-content">
        <div className="event-header">
          {event.image ? (
            <div className="event-image">
              <img src={event.image} alt={event.name} />
            </div>
          ) : (
            <div className="event-image no-image-placeholder">
              <span className="no-image-emoji">🖼️</span>
              <span className="no-image-text">No Image Available</span>
            </div>
          )}
          
          <h3 className="event-name">
            <span className="event-emoji">🎉</span>
            {event.name}
          </h3>

          <div className="event-meta">
            <div className="meta-item">
              <span className="meta-emoji">📅</span>
              <div>
                <div className="meta-label">Date</div>
                <div className="meta-value">{formatDate(event.date)}</div>
              </div>
            </div>
            
            <div className="meta-item">
              <span className="meta-emoji">⏰</span>
              <div>
                <div className="meta-label">Time</div>
                <div className="meta-value">{formatTime(event.time)}</div>
              </div>
            </div>
            
            <div className="meta-item">
              <span className="meta-emoji">💰</span>
              <div>
                <div className="meta-label">Cost</div>
                <div className="meta-value">
                  {event.cost && event.cost > 0 ? `${event.cost} RON` : 'Free'}
                </div>
              </div>
            </div>
            
            <div className="meta-item">
              <span className="meta-emoji">📊</span>
              <div>
                <div className="meta-label">Status</div>
                <div className="meta-value">
                  <span className={`status-badge ${status}`}>
                    {status === 'upcoming' ? '🔜 Upcoming' : '✅ Completed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {event.description && (
          <div className="detail-section">
            <h4 className="section-title">
              <span className="section-emoji">📝</span>
              Description
            </h4>
            <div className="description-text">
              {event.description}
            </div>
          </div>
        )}

        <div className="detail-section">
          <h4 className="section-title">
            <span className="section-emoji">📍</span>
            Location Information
          </h4>
          <div className="location-info">
            {event.location?.exact && (
              <div className="location-item">
                <span className="location-emoji">🏢</span>
                <div>
                  <strong>Venue:</strong> {event.location.exact}
                </div>
              </div>
            )}
            
            {event.zoneDetails && (
              <div className="location-item">
                <span className="location-emoji">🗺️</span>
                <div>
                  <strong>Zone:</strong> {event.zoneDetails.name}
                </div>
              </div>
            )}
            
            {event.location?.latitude && event.location?.longitude && (
              <div className="location-item">
                <span className="location-emoji">🧭</span>
                <div>
                  <strong>Coordinates:</strong> {event.location.latitude}, {event.location.longitude}
                </div>
              </div>
            )}
            
            {!event.location?.exact && !event.zoneDetails && (
              <div className="no-data-message">
                <span className="no-data-emoji">📍</span>
                <p>Location information not available</p>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h4 className="section-title">
            <span className="section-emoji">📂</span>
            Categories
          </h4>
          {event.categoryDetails && event.categoryDetails.length > 0 ? (
            <div className="categories-list">
              {event.categoryDetails.map((category, index) => (
                <span key={index} className="category-badge">
                  <span className="category-emoji">📁</span>
                  {category.category_name || category.name}
                </span>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <span className="no-data-emoji">📂</span>
              <p>No categories assigned to this event</p>
            </div>
          )}
        </div>

        <div className="detail-section">
          <h4 className="section-title">
            <span className="section-emoji">⭐</span>
            Reviews ({event.reviews ? event.reviews.length : 0})
          </h4>
          {event.reviews && event.reviews.length > 0 ? (
            <div className="reviews-list">
              {event.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="review-user">
                      <span className="user-emoji">👤</span>
                      {review.userName || 'Anonymous User'}
                    </div>
                    <div className="review-grade">
                      <span className="star-emoji">{renderStars(review.grade)}</span>
                      <span>{review.grade}/5</span>
                    </div>
                  </div>
                  {review.reviewText && (
                    <div className="review-text">
                      "{review.reviewText}"
                    </div>
                  )}
                  {review.timestamp && (
                    <div className="review-date">
                      {new Date(review.timestamp).toLocaleDateString('en-GB')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <span className="no-data-emoji">⭐</span>
              <p>No reviews available for this event</p>
            </div>
          )}
        </div>
      </div>

      <div className="detail-footer">
        <button className="secondary-button" onClick={onClose}>
          <span className="button-emoji">✖️</span>
          Close
        </button>
        {onEdit && (
          <button className="primary-button" onClick={() => onEdit(event)}>
            <span className="button-emoji">✏️</span>
            Edit Event
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetails;