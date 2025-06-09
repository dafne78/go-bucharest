import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

      <section className="events-section">
        <div className="section-header">
          <h2>Events</h2>
          <button 
            onClick={() => navigate('/events')}
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
                  className="dashboard-event-image"
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
                  Category: {event.categoryDetails && event.categoryDetails.length > 0
                    ? event.categoryDetails.map(category => category.category_name).join(', ')
                    : 'No category'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;