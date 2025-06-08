import React, { useState, useEffect } from 'react';
import './Profile.css';
import { event_list} from '../../assets/events';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaHistory, FaEdit, FaStar, FaUserShield } from 'react-icons/fa';
import EventCard from '../../Components/EventCard/EventCard';
import ProfileEditForm from '../../Components/ProfileEditForm/ProfileEditForm';
import apiService from '../../services/apiService';
import authService from '../../services/authService';

const Profile = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // User data state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bio: "",
    interests: []
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get('/auth/me');
        
        if (response.success && response.data) {
          setUserData({
            ...response.data,
            interests: response.data.interests || []
          });
          setIsAdmin(response.data.role === 'admin');
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Set initial selected date
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  // Update selected date when calendar tab is active
  useEffect(() => {
    if (activeTab === "calendar" && !selectedDate) {
      setSelectedDate(new Date());
    }
  }, [activeTab, selectedDate]);

  // Filter events - only past events for the events tab
  const pastEvents = event_list
    .filter(event => new Date(event.date) < new Date())
    .slice(0, 6);

  // Events for specific date
  const getEventsForDate = (date) => {
    if (!date) return [];
    return event_list.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Check if a date has events
  const hasEvents = (date) => {
    return getEventsForDate(date).length > 0;
  };

  // Custom tile content for calendar
  const tileContent = ({ date, view }) => {
    if (view === 'month' && hasEvents(date)) {
      return <div className="event-dot"></div>;
    }
    return null;
  };

  // Custom tile class for calendar
  const tileClassName = ({ date, view }) => {
    if (view === 'month' && hasEvents(date)) {
      return 'has-events';
    }
    return null;
  };

  // Handler for calendar date click
  const handleDateClick = (value) => {
    setDate(value);
    setSelectedDate(value);
  };

  // Check if user has left a review for an event
  const hasLeftReview = (event) => {
    if (!event.reviews) return false;
    return event.reviews.some(review => review.userId === userData.id);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Save profile data after editing
  const handleSaveProfile = async (formData) => {
    try {
      setIsLoading(true);
      const response = await apiService.put(`/users/${userData.id}`, formData);
      
      if (response.success && response.data) {
        setUserData({
          ...response.data,
          profileImage: response.data.profileImage || userData.profileImage
        });
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle admin panel navigation
  const handleAdminPanelClick = () => {
    const token = authService.getToken();
    if (token) {
      // Store token temporarily in localStorage with a specific key for admin panel
      localStorage.setItem('admin_auth_token', token);
      // Open admin panel in a new window
      window.open('http://localhost:3001/admin', '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-main-container">
      {/* Profile Tab Navigation */}
      <div className="profile-navigation">
        <button 
          className={`profile-nav-item ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          <FaUser className="profile-nav-icon" />
          <span>Profile Info</span>
        </button>
        <button 
          className={`profile-nav-item ${activeTab === "calendar" ? "active" : ""}`}
          onClick={() => setActiveTab("calendar")}
        >
          <FaCalendarAlt className="profile-nav-icon" />
          <span>Calendar</span>
        </button>
        <button 
          className={`profile-nav-item ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          <FaHistory className="profile-nav-icon" />
          <span>Past Events</span>
        </button>
      </div>

      {/* Profile Content */}
      {activeTab === "info" && !isEditing && (
        <div className="profile-info-section">
          <div className="profile-info-row">
            <div className="profile-details">
              <div className="profile-header">
                <h1>{userData.name}</h1>
                <div className="profile-actions">
                  <button className="edit-profile-button" onClick={toggleEditMode}>
                    <FaEdit /> Edit Profile
                  </button>
                  {isAdmin && (
                    <button 
                      className="admin-panel-button"
                      onClick={handleAdminPanelClick}
                    >
                      <FaUserShield /> Admin Panel
                    </button>
                  )}
                </div>
              </div>
              <p className="user-bio">{userData.bio || 'No bio available'}</p>
              
              <div className="user-tags">
                <div className="tags-section interests-section">
                  <h3>Interests</h3>
                  <div className="tags-list">
                    {userData.interests.length > 0 ? (
                      userData.interests.map((interest, index) => (
                        <span key={index} className="tag">{interest}</span>
                      ))
                    ) : (
                      <p className="no-tags">No interests added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "info" && isEditing && (
        <ProfileEditForm 
          user={userData} 
          onSave={handleSaveProfile} 
          onCancel={toggleEditMode} 
        />
      )}

      {activeTab === "calendar" && (
        <div className="calendar-section">
          <div className="calendar-wrapper">
            <Calendar
              onChange={handleDateClick}
              value={date}
              tileContent={tileContent}
              tileClassName={tileClassName}
            />
          </div>
          
          {selectedDate && (
            <div className="selected-date-events">
              <h3>Events for {selectedDate.toLocaleDateString()}</h3>
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="date-events-list">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event._id} className="date-event-item">
                      <img src={event.image} alt={event.name} className="date-event-image" />
                      <div className="date-event-info">
                        <h4>{event.name}</h4>
                        <p><span className="event-time-label">Time:</span> {event.time}</p>
                        <p><span className="event-location-label">Location:</span> {event.location.exact}</p>
                        <Link to={`/events/${event._id}`} className="view-event-button">
                          View Event
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-events-for-date">
                  <p>{selectedDate.toDateString() === new Date().toDateString() ? 
                    "You are free today! 🎉" : 
                    "No events scheduled for this day! 🎉"}</p>
                  <p className="no-events-suggestion">Looking for something to do?</p>
                  <Link to="/events" className="browse-events-link">Discover Events</Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "events" && (
        <div className="profile-events-section">
          <h2 className="section-title">Your Past Events</h2>
          {pastEvents.length > 0 ? (
            <div className="events-grid">
              {pastEvents.map(event => (
                <div key={event._id} className="past-event-card">
                  <EventCard event={event} />
                  {!hasLeftReview(event) && (
                    <div className="review-reminder">
                      <FaStar className="review-star-icon" />
                      <p>You haven't left a review yet!</p>
                      <Link to={`/reviews/${event._id}`} className="leave-review-button">
                        Leave a Review
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events-message">
              You haven't attended any events yet.
              <Link to="/events" className="browse-events-link">Browse events</Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;