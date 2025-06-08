import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Review.css";
import { FaStar, FaCalendarAlt, FaClock } from 'react-icons/fa';
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

const ReviewPage = () => {
  const [event_list, setEvent_list] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

        // Fetch user's bookings
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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // State for review form inputs keyed by event id
  const [reviewsState, setReviewsState] = useState({});

  // State for all events pagination
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;
  const totalPages = Math.ceil(event_list.length / eventsPerPage);

  const handleReviewChange = (eventId, field, value) => {
    setReviewsState(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: value
      }
    }));
  };

  const handleSubmitReview = async (eventId) => {
    try {
      const review = reviewsState[eventId];
      if (!review?.rating) {
        alert('Please select a rating');
        return;
      }

      const response = await apiService.post(`/events/${eventId}/reviews`, {
        rating: review.rating,
        comment: review.comment
      });

      if (response.success) {
        // Update the local state to reflect the new review
        setPastEvents(prev => 
          prev.map(event => {
            if (event._id === eventId) {
              return {
                ...event,
                reviews: [...(event.reviews || []), response.data]
              };
            }
            return event;
          })
        );
        
        // Clear the review form for this event
        setReviewsState(prev => ({
          ...prev,
          [eventId]: { rating: 0, comment: "" }
        }));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="review-container">
      <div className="review-hero">
        <h1>Review Your Events</h1>
        <p>Share your experience and help others discover great events</p>
      </div>
      
      <section className="attended-events">
        <h2 className="review-title">Past Events</h2>
        {pastEvents.length > 0 ? (
          <div className="review-forms">
            {pastEvents.map(event => (
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
                        {new Date(event.date).toLocaleDateString()}
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
                  </div>
                </div>
                
                <div className="review-form">
                  <div className="rating-input">
                    <label>Rating:</label>
                    <StarRating
                      rating={reviewsState[event._id]?.rating || 0}
                      setRating={(rating) => handleReviewChange(event._id, 'rating', rating)}
                    />
                  </div>
                  <div className="comment-input">
                    <label>Comment:</label>
                    <textarea
                      className="review-textarea"
                      value={reviewsState[event._id]?.comment || ""}
                      onChange={(e) => handleReviewChange(event._id, 'comment', e.target.value)}
                      placeholder="Share your experience..."
                    />
                  </div>
                  <button 
                    className="submit-review-btn"
                    onClick={() => handleSubmitReview(event._id)}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-events-message">You haven't attended any past events yet.</p>
        )}
      </section>

      {futureEvents.length > 0 && (
        <section className="future-events">
          <h2 className="review-title">Upcoming Events</h2>
          <div className="review-forms">
            {futureEvents.map(event => (
              <div key={event._id} className="event-review-card future">
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
                        {new Date(event.date).toLocaleDateString()}
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
                  </div>
                </div>
                <div className="future-event-message">
                  <p>This event is in the future. You can review it after attending.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="divider"></div>

      <section className="all-events">
        <h2 className="all-events-title">All Events</h2>
        <div className="events-grid">
          {event_list
            .slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)
            .map(event => (
              <div key={event._id} className="event-listing">
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
                        {new Date(event.date).toLocaleDateString()}
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
                    <button 
                      className="event-details-btn"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      View Event Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default ReviewPage;