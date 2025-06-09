import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Review.css";
import { FaStar, FaCalendarAlt, FaClock, FaHistory, FaInfoCircle } from 'react-icons/fa';
import apiService from '../../services/apiService';
import authService from '../../services/authService';

// StarRating component for selecting rating
function StarRating({ rating, setRating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "star active" : "star"}
          onClick={() => setRating(star)}
        >
          <FaStar />
        </span>
      ))}
    </div>
  );
}

const ReviewPage = ({ isLoggedIn }) => {
  const [event_list, setEvent_list] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State for review form inputs keyed by event id
  const [reviewsState, setReviewsState] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all events
        const eventsResponse = await apiService.get('/events');
        if (eventsResponse.success && eventsResponse.data) {
          setEvent_list(eventsResponse.data);
        } else {
          throw new Error('Failed to fetch events');
        }

        // Fetch user's bookings only if logged in
        if (isLoggedIn) {
          const bookingsResponse = await apiService.get('/bookings/my-events');
          if (bookingsResponse.success && bookingsResponse.data) {
            const now = new Date();
            const past = [];
            const future = [];

            bookingsResponse.data.forEach(booking => {
              const eventDate = new Date(booking.event.date);
              if (eventDate < now) {
                past.push(booking.event);
              } else {
                future.push(booking.event);
              }
            });

            setPastEvents(past);
            setFutureEvents(future);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  const handleReviewChange = (eventId, field, value) => {
    setReviewsState(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: value
      }
    }));
  };

  const handleReviewSubmit = async (eventId) => {
    try {
      const review = reviewsState[eventId];
      if (!review || !review.grade || !review.comment) {
        throw new Error('Please provide both rating and comment');
      }

      const response = await apiService.post(`/events/${eventId}/reviews`, review);
      if (response.success) {
        // Update the event list to reflect the new review
        setEvent_list(prev => prev.map(event => 
          event._id === eventId 
            ? { ...event, reviews: [...(event.reviews || []), response.data] }
            : event
        ));
        // Clear the review form
        setReviewsState(prev => {
          const newState = { ...prev };
          delete newState[eventId];
          return newState;
        });
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message);
    }
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.grade, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Events</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-container">
      <div className="review-hero">
        <h1>Event Reviews</h1>
        <p>Share your experience and help others discover great events</p>
      </div>
      
      {/* Past Events Section */}
      <section className="attended-events">
        <h2 className="review-title">Past Events</h2>
        {!isLoggedIn ? (
          <div className="login-message-review">
            <h2>Please Log In</h2>
            <p>You need to be logged in to view and submit reviews for past events.</p>
            <button onClick={() => navigate('/login')} className="login-button">
              Log In
            </button>
          </div>
        ) : pastEvents.length > 0 ? (
          <div className="review-forms">
            {pastEvents.map(event => {
              const hasUserReview = event.reviews?.some(review => review.user === localStorage.getItem('userId'));
              return (
                <div key={event._id} className="event-review-card">
                  <div className="two-column">
                    <div className="event-image-wrapper">
                      <img src={event.image} alt={event.name} className="event-image" />
                    </div>
                    <div className="event-text">
                      <h3>{event.name}</h3>
                      <p>{event.description}</p>
                      <div className="event-details">
                        <p>
                          <FaCalendarAlt className="event-icon" />
                          {formatDate(event.date)}
                        </p>
                        <p>
                          <FaClock className="event-icon" />
                          {new Date(event.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p>Location: {event.location.exact}</p>
                      </div>
                      
                      {hasUserReview ? (
                        <div className="review-submitted-message">
                          <FaInfoCircle className="info-icon" />
                          <p>You have already submitted a review for this event.</p>
                        </div>
                      ) : (
                        <div className="review-form">
                          <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <FaStar
                                key={star}
                                className={`star ${reviewsState[event._id]?.grade >= star ? 'active' : ''}`}
                                onClick={() => handleReviewChange(event._id, 'grade', star)}
                              />
                            ))}
                          </div>
                          <textarea
                            className="review-textarea"
                            placeholder="Write your review..."
                            value={reviewsState[event._id]?.comment || ''}
                            onChange={(e) => handleReviewChange(event._id, 'comment', e.target.value)}
                          />
                          <button
                            className="submit-review-button"
                            onClick={() => handleReviewSubmit(event._id)}
                          >
                            Submit Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-events-message">
            <FaHistory className="no-events-icon" />
            <p>You haven't attended any events yet.</p>
          </div>
        )}
      </section>

      {/* All Events Section */}
      <section className="all-events">
        <h2 className="all-events-title">All Events</h2>
        <div className="events-grid">
          {event_list.map(event => (
            <div key={event._id} className="event-card">
              <div className="event-card-image">
                <img src={event.image} alt={event.name} />
              </div>
              <div className="event-card-content">
                <h3>{event.name}</h3>
                <p className="event-card-description">{event.description}</p>
                <div className="event-card-details">
                  <p>
                    <FaCalendarAlt className="event-icon" />
                    {formatDate(event.date)}
                  </p>
                  <p>
                    <FaClock className="event-icon" />
                    {new Date(event.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p>Location: {event.location.exact}</p>
                </div>
                
                {/* Reviews Section */}
                <div className="event-card-reviews">
                  <h4>Reviews ({event.reviews?.length || 0})</h4>
                  {event.reviews && event.reviews.length > 0 ? (
                    <div className="reviews-list">
                      {event.reviews.map((review, index) => (
                        <div key={index} className="review-item">
                          <div className="review-header">
                            <div className="review-rating">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`star ${i < review.grade ? 'active' : ''}`}
                                />
                              ))}
                            </div>
                            <span className="review-date">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-reviews-message">No reviews yet</p>
                  )}
                </div>
                
                <button 
                  className="event-details-btn"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  View Event Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ReviewPage;