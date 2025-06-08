import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import authService from '../../services/authService';
import Notification from '../../Components/Notification/Notification';
import './EventDetails.css';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/events/${id}`);
      
      if (response.success && response.data) {
        setEvent(response.data);
      } else {
        throw new Error('Failed to fetch event details');
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      showNotification(error.message || 'Could not load event details', 'error');
      setError(error.message || 'Could not load event details');
    } finally {
      setLoading(false);
    }
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
        eventId: id
      });

      if (response.success) {
        showNotification('Booking successful! You are now registered for this event.', 'success');
        fetchEventDetails();
      } else {
        throw new Error(response.message || 'Failed to book event');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsBooking(false);
    }
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

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.grade, 0);
    return (sum / reviews.length).toFixed(1);
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Event</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchEventDetails}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Event Not Found</h3>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <button className="retry-button" onClick={() => navigate('/events')}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="event-details-container">
        <div className="event-header">
          {event.image ? (
            <img src={event.image} alt={event.name} className="event-main-image" />
          ) : (
            <div className="no-image-placeholder">
              <span className="no-image-emoji">🖼️</span>
              <span className="no-image-text">No Image Available</span>
            </div>
          )}
          
          <div className="event-header-info">
            <h1>{event.name}</h1>
            
            <div className="event-meta">
              <div className="meta-item">
                <span className="meta-emoji">💰</span>
                <div className="meta-value">
                  {event.cost && event.cost > 0 ? `${event.cost} RON` : 'Free Entry'}
                </div>
              </div>
              
              <div className="meta-item">
                <span className="meta-emoji">⭐</span>
                <div className="meta-value">
                  {getAverageRating(event.reviews)} ({event.reviews?.length || 0} reviews)
                </div>
              </div>
            </div>

            <div className="event-datetime-location">
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
                <span className="meta-emoji">📍</span>
                <div>
                  <div className="meta-label">Location</div>
                  <div className="meta-value">
                    {event.location?.exact && <div>{event.location.exact}</div>}
                    {event.zoneDetails && <div>{event.zoneDetails.name}</div>}
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="event-book-button"
              onClick={handleBooking}
              disabled={isBooking}
            >
              {isBooking ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        </div>

        {event.description && (
          <div className="event-description">
            <h3>
              <span className="section-emoji">📝</span>
              Description
            </h3>
            <p>{event.description}</p>
          </div>
        )}

        {event.categoryDetails && event.categoryDetails.length > 0 && (
          <div className="event-categories">
            <h3>
              <span className="section-emoji">📂</span>
              Categories
            </h3>
            <div className="category-tags">
              {event.categoryDetails.map((category, index) => (
                <span key={index} className="category-tag">
                  {category.category_name || category.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="event-reviews">
          <h3>
            <span className="section-emoji">⭐</span>
            Reviews ({event.reviews?.length || 0})
          </h3>
          
          {event.reviews && event.reviews.length > 0 ? (
            <div className="review-list">
              {event.reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-content">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <span className="no-reviews-emoji">📝</span>
              <p>No reviews yet. Be the first to review this event!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventDetailsPage;
