import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Review.css";
import {getAverageRating } from '../../assets/events';
import apiService from '../../services/apiService';


// StarRating component for selecting rating
function StarRating({ rating, setRating }) {
  return (
    <div>
      {[1,2,3,4,5].map((star) => (
        <span
          key={star}
          style={{ cursor: "pointer", color: star <= rating ? "gold" : "gray", fontSize: 24 }}
          onClick={() => setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

const ReviewPage = ({ isLoggedIn }) => {
  const [event_list, setEvent_list] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get('/events');
        
        if (response.success && response.data) {
          setEvent_list(response.data);
        } else {
          throw new Error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);
  
  const navigate = useNavigate();
  // Mock attended events for current user
  const attendedEventIds = ["e1", "e5", "e9"];
  const attendedEvents = event_list.filter(e => attendedEventIds.includes(e._id));

  // State for review form inputs keyed by event id
  const [reviewsState, setReviewsState] = useState(
    attendedEvents.reduce((acc, event) => {
      acc[event._id] = { rating: 0, comment: "" };
      return acc;
    }, {})
  );

  // State for all events pagination
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;
  const totalPages = Math.ceil(event_list.length / eventsPerPage);

  const handleReviewChange = (eventId, field, value) => {
    setReviewsState(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: value,
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="events-loading">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  const submitReview = (eventId) => {
    const { rating, comment } = reviewsState[eventId];
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }
    // For demo: just alert - in real app you'd send to backend or update state
    alert(`Submitted review for event ${eventId}:\nRating: ${rating}\nComment: ${comment}`);
    // Clear form
    setReviewsState(prev => ({
      ...prev,
      [eventId]: { rating: 0, comment: "" }
    }));
  };

  // Pagination logic for all events
  const paginatedEvents = event_list.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );


  return (
    <div className="review-container">
        {(!isLoggedIn) ? 
            <div className="review-hero">
                <div className="login-message-review">
                  <h2>You must be logged in to leave a review and see your attended events.</h2>
                  <button 
                      onClick={() => navigate('/profile')} // Navigate to login page
                      className="login-redirect-btn"
                  >
                      Go to Login Page
                  </button>
                </div>
            </div>
        :
        <div>
          <div className="review-hero-login">
            <h1>Attended Events? Share Your Experience!</h1>
            <p>Tell us about your unforgettable night and help others discover the magic</p>
          </div>
            {attendedEvents.length === 0 && <p className="no-events-message">You have no attended events yet.</p>}
            {attendedEvents.map(event => (
                <div key={event._id} className="event-review-card">
                <h3>{event.name}</h3>
                <div className="star-rating">
                    <StarRating 
                    rating={reviewsState[event._id].rating} 
                    setRating={(rating) => handleReviewChange(event._id, "rating", rating)} 
                    />
                </div>
                <textarea
                    className="review-textarea"
                    placeholder="Leave a comment (optional)"
                    value={reviewsState[event._id].comment}
                    onChange={e => handleReviewChange(event._id, "comment", e.target.value)}
                    rows={3}
                />
                <button 
                    onClick={() => submitReview(event._id)} 
                    className="submit-review-btn"
                >
                    Submit Review
                </button>
            </div>
      ))}
        </div> 
    } 
      <hr className="divider" />

      <h1 className="all-events-title">All Events Reviews</h1>
      {paginatedEvents.map(event => (
        <div key={event._id} className="event-listing two-column">
          <div className="event-text">
            <h3>{event.name}</h3>
            <button 
              onClick={() => {
                navigate(`/events/${event._id}`);
                window.dispatchEvent(new Event('popstate'));
              }}
              className="event-details-btn"
            >
              View Details
            </button>
            <p className="rating-display">
              Average Rating: {event.reviews && event.reviews.length > 0 ? getAverageRating(event.reviews) + ' ⭐' : 'No reviews yet'}
            </p>
            <p>{event.description}</p>
          </div>
          <div className="event-image-wrapper">
            <img src={event.image} alt={event.name} className="event-image" />
          </div>
        </div>
      ))}

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="page-info">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ReviewPage;