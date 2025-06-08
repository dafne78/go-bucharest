import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import apiService from '../../services/apiService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch users
        const usersResponse = await apiService.get('/users');
        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data);
        } else {
          throw new Error('Failed to fetch users');
        }

        // Fetch events
        const eventsResponse = await apiService.get('/events');
        if (eventsResponse.success && eventsResponse.data) {
          setEvents(eventsResponse.data);
        } else {
          throw new Error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of your application</p>
      </div>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Events</h3>
          <p className="stat-number">{events.length}</p>
        </div>
      </section>

      {/* Users Section */}
      <section className="users-section">
        <div className="section-header">
          <h2>Users</h2>
          <button 
            onClick={() => navigate('/admin/users')}
            className="view-all-btn"
          >
            View All Users
          </button>
        </div>
        <div className="users-grid">
          {users.slice(0, 5).map(user => (
            <div key={user._id} className="user-card">
              <div className="user-header">
                <img 
                  src={user.profileImage || 'https://via.placeholder.com/50'} 
                  alt={user.name} 
                  className="user-avatar"
                />
                <div className="user-info">
                  <h3 className="user-name">{user.name}</h3>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
              <div className="user-details">
                <p className="user-role">Role: {user.role || 'User'}</p>
                <p className="user-joined">Joined: {formatDate(user.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section className="events-section">
        <div className="section-header">
          <h2>Events</h2>
          <button 
            onClick={() => navigate('/admin/events')}
            className="view-all-btn"
          >
            View All Events
          </button>
        </div>
        <div className="events-grid">
          {events.slice(0, 5).map(event => (
            <div key={event._id} className="event-card">
              <div className="event-header">
                <img 
                  src={event.image} 
                  alt={event.name} 
                  className="event-image"
                />
                <div className="event-info">
                  <h3 className="event-name">{event.name}</h3>
                  <p className="event-date">{formatDate(event.date)}</p>
                </div>
              </div>
              <div className="event-details">
                <p className="event-location">
                  Location: {event.zoneDetails ? event.zoneDetails.name : event.location?.zone}
                </p>
                <p className="event-category">
                  Category: {event.categoryDetails ? event.categoryDetails.category_name : event.category}
                </p>
                <button 
                  onClick={() => navigate(`/events/${event._id}`)}
                  className="view-event-btn"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.name}</h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="event-detail-image">
                <img src={selectedEvent.image} alt={selectedEvent.name} />
              </div>
              <div className="event-detail-info">
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">
                    {selectedEvent.zoneDetails ? selectedEvent.zoneDetails.name : selectedEvent.location?.zone}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">
                    {selectedEvent.categoryDetails ? selectedEvent.categoryDetails.category_name : selectedEvent.category}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <p className="detail-value description">{selectedEvent.description}</p>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">{selectedEvent.price} RON</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Available Tickets:</span>
                  <span className="detail-value">{selectedEvent.availableTickets}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="edit-button"
                onClick={() => navigate(`/admin/events/${selectedEvent._id}`)}
              >
                Edit Event
              </button>
              <button className="close-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;