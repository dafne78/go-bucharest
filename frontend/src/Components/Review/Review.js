import React, { useState, useEffect } from 'react';
import './Review.css';
import apiService from '../../services/apiService';

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get('/reviews');
        
        if (response.success && response.data) {
          setReviews(response.data);
        } else {
          throw new Error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError(error.message || 'Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

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

  if (isLoading) {
    return (
      <div className="reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <h2 className="section-title">What Our Users Say</h2>
      <div className="reviews-grid">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <img 
                    src={review.user?.profileImage || 'https://via.placeholder.com/50'} 
                    alt={review.user?.name || 'User'} 
                    className="reviewer-avatar"
                  />
                  <div className="reviewer-details">
                    <h3 className="reviewer-name">{review.user?.name || 'Anonymous'}</h3>
                    <p className="review-date">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="review-rating">
                  {[...Array(5)].map((_, index) => (
                    <span 
                      key={index} 
                      className={`star ${index < review.rating ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="review-text">{review.comment}</p>
              {review.event && (
                <div className="review-event">
                  <span className="event-label">Event:</span>
                  <span className="event-name">{review.event.name}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-reviews">
            <p>No reviews available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review; 