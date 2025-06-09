import React, { useState, useEffect } from 'react';
import './Profile.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaHistory, FaEdit, FaStar, FaUserShield } from 'react-icons/fa';
import EventCard from '../EventCard/EventCard';
import ProfileEditForm from '../ProfileEditForm/ProfileEditForm';
import apiService from '../../services/apiService';
import authService from '../../services/authService';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  // User data state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bio: "",
    interests: []
  });

  // Fetch user data and bookings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user data
        const userResponse = await apiService.get('/auth/me');
        if (userResponse.success && userResponse.data) {
          setUserData({
            ...userResponse.data,
            interests: userResponse.data.interests || []
          });
          setIsAdmin(userResponse.data.role === 'admin');
        } else {
          throw new Error('Failed to fetch user data');
        }

        // Fetch user's bookings
        const bookingsResponse = await apiService.get('/bookings/my-events');
        if (bookingsResponse.success && bookingsResponse.data) {
          setBookings(bookingsResponse.data);
          
          // Separate past and upcoming events
          const now = new Date();
          const past = [];
          const upcoming = [];
          
          bookingsResponse.data.forEach(booking => {
            const eventDate = new Date(booking.event.date);
            if (eventDate < now) {
              past.push(booking.event);
            } else {
              upcoming.push(booking.event);
            }
          });
          
          setPastEvents(past);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set initial selected date
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    // Filter events for the selected date
    const eventsOnDate = bookings.filter(booking => {
      const eventDate = new Date(booking.event.date);
      return eventDate.toDateString() === newDate.toDateString();
    });
    setSelectedDateEvents(eventsOnDate);
  };

  // Function to check if a date has events
  const tileContent = ({ date }) => {
    const hasEvents = bookings.some(booking => {
      const eventDate = new Date(booking.event.date);
      return eventDate.toDateString() === date.toDateString();
    });

    return hasEvents ? <div className="event-dot" /> : null;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSave = async (updatedData) => {
    try {
      const response = await apiService.put('/auth/me', updatedData);
      if (response.success && response.data) {
        setUserData({
          ...response.data,
          interests: response.data.interests || []
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    }
  };

  const handleAdminPanelClick = (e) => {
    e.preventDefault();
    const token = authService.getToken();
    if (token) {
      // Navigate to admin panel with token in URL
      window.location.href = `http://localhost:3001/admin?token=${encodeURIComponent(token)}`;
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
      <div className="profile-navigation">
        <button
          className={`profile-nav-item ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          <FaUser className="profile-nav-icon" /> Profile Info
        </button>
        <button
          className={`profile-nav-item ${activeTab === "calendar" ? "active" : ""}`}
          onClick={() => setActiveTab("calendar")}
        >
          <FaCalendarAlt className="profile-nav-icon" /> Calendar
        </button>
        <button
          className={`profile-nav-item ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory className="profile-nav-icon" /> Past Events
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "info" && (
          <div className="profile-info-section">
            <div className="profile-header">
              <h1>{userData.name}</h1>
              <div className="profile-actions">
                {isAdmin && (
                  <a href="http://localhost:3001/admin" 
                     className="admin-panel-button"
                     onClick={handleAdminPanelClick}>
                    <FaUserShield /> Admin Panel
                  </a>
                )}
                <button className="edit-profile-button" onClick={handleEditClick}>
                  <FaEdit /> Edit Profile
                </button>
              </div>
            </div>

            {isEditing ? (
              <ProfileEditForm
                userData={userData}
                onSave={handleEditSave}
                onCancel={handleEditCancel}
              />
            ) : (
              <>
                <div className="user-bio">
                  {userData.bio || "No bio provided"}
                </div>
                <div className="user-tags">
                  <div className="tags-section">
                    <h3>Interests</h3>
                    <div className="tags-list">
                      {userData.interests.length > 0 ? (
                        userData.interests.map((interest, index) => (
                          <span key={index} className="tag">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="no-tags">No interests added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="calendar-section">
            <div className="calendar-wrapper">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                className="react-calendar"
                tileContent={tileContent}
              />
            </div>
            {selectedDateEvents.length > 0 && (
              <div className="selected-date-events">
                <h3 className="selected-date-title">
                  Events on {selectedDate.toLocaleDateString()}
                </h3>
                <div className="date-events-list">
                  {selectedDateEvents.map((booking) => (
                    <div key={booking._id} className="date-event-item">
                      <img
                        src={booking.event.image}
                        alt={booking.event.title}
                        className="date-event-image"
                      />
                      <div className="date-event-info">
                        <h4>{booking.event.title}</h4>
                        <p>
                          <span className="event-time-label">
                            {new Date(booking.event.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </p>
                        <Link
                          to={`/events/${booking.event._id}`}
                          className="view-event-button"
                        >
                          View Event
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="past-events-section">
            <h2 className="past-events-title">Past Events</h2>
            {pastEvents.length > 0 ? (
              <div className="past-events-list">
                {pastEvents.map((event) => (
                  <div key={event.id} className="past-event-card">
                    <div className="past-event-image-container">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="past-event-image"
                      />
                    </div>
                    <div className="past-event-content">
                      <h3 className="past-event-title">{event.title}</h3>
                      <div className="past-event-details">
                        <span className="past-event-date">
                          <FaCalendarAlt className="past-event-icon" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="past-event-description">{event.description}</p>
                      <div className="past-event-footer">
                        <Link
                          to={`/events/${event.id}`}
                          className="view-past-event-button"
                        >
                          View Event Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-past-events">
                <FaHistory className="no-past-events-icon" />
                <p className="no-past-events-message">No past events found</p>
                <p className="no-past-events-submessage">
                  Your past event history will appear here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;