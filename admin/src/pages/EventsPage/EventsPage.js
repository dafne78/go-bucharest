import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header/Header';
import authService from '../../services/authService';
import eventService from '../../services/eventsService';
import './Events.css';
import EventList from '../../components/events/EventList/EventList';
import EventForm from '../../components/events/EventForm/EventForm';
import EventDetails from '../../components/events/EventDetails/EventDetails';

const EventsPage = () => {
  // Get user from auth service
  const [user, setUser] = useState(authService.getUser());
  
  // Your existing state
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeView, setActiveView] = useState('list');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    // Update user state
    const currentUser = authService.getUser();
    setUser(currentUser);
    console.log('Current user in EventsPage:', currentUser);
  }, []);

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setActiveView('add');
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    console.log("Selected event for edit:", event);
    setActiveView('edit');
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    console.log("Selected event for view:", event);
    setActiveView('view');
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.name}"?`)) {
      try {
        await eventService.deleteEvent(event._id);
        
        // Remove the deleted event from the state
        const updatedEvents = events.filter(e => e._id !== event._id);
        setEvents(updatedEvents);
        
        // Apply current filter to the updated events
        applyFilter(filter, updatedEvents);
        
        showSuccessMessage('Event deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        setError(error.message || 'Failed to delete event');
      }
    }
  };

  const handleCloseForm = () => {
    setActiveView('list');
    setSelectedEvent(null);
    setError(null);
  };

  const handleSaveEvent = async (eventData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let updatedEvents;
      
      if (selectedEvent) {
        // Update existing Event
        console.log("Updating event:", selectedEvent);
        await eventService.updateEvent(selectedEvent._id, eventData);
        setSuccessMessage('Event updated successfully!');
        
        // Update the event in the state
        updatedEvents = events.map(event => 
          event._id === selectedEvent._id 
            ? { ...event, ...eventData } 
            : event
        );
      } else {
        // Add new Event
        const newEvent = await eventService.createEvent(eventData);
        setSuccessMessage('Event added successfully!');
        
        // Add the new event to the state
        updatedEvents = [...events, newEvent.data || newEvent];
      }
      
      setEvents(updatedEvents);
      applyFilter(filter, updatedEvents);
      
      // Show success message
      setShowSuccess(true);
      
      // Close success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Return to list
      setActiveView('list');
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error.message || 'Could not save the event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine event status
  const getEventStatus = (eventDate) => {
    const currentDate = new Date().toISOString().split('T')[0];
    return eventDate > currentDate ? 'upcoming' : 'completed';
  };

  // Show success message with auto-hide
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Fetch all events from backend (only once)
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching all events...');
      
      const response = await eventService.getEvents(); // Get all events
      console.log('API Response:', response);
      
      if (response.success) {
        setEvents(response.data);
        applyFilter('all', response.data); // Initially show all events
      } else {
        throw new Error(response.message || 'Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Apply filter based on event status
  const applyFilter = (filterType, eventsToFilter = events) => {
    let filtered = [...eventsToFilter];

    if (filterType === 'upcoming') {
      filtered = filtered.filter(event => getEventStatus(event.date) === 'upcoming');
    } else if (filterType === 'completed') {
      filtered = filtered.filter(event => getEventStatus(event.date) === 'completed');
    }
    // For 'all', we don't filter anything

    // Sort by date (upcoming events first, then by date)
    filtered.sort((a, b) => {
      const statusA = getEventStatus(a.date);
      const statusB = getEventStatus(b.date);
      
      // If both are upcoming or both are completed, sort by date
      if (statusA === statusB) {
        return new Date(a.date) - new Date(b.date);
      }
      
      // Upcoming events come first
      return statusA === 'upcoming' ? -1 : 1;
    });

    setFilteredEvents(filtered);
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFilter(newFilter);
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Get counts for filter buttons
  const getAllEventsCount = () => events.length;
  const getUpcomingEventsCount = () => events.filter(e => getEventStatus(e.date) === 'upcoming').length;
  const getCompletedEventsCount = () => events.filter(e => getEventStatus(e.date) === 'completed').length;

  // Add modal styles to ensure proper display
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalContentStyle = {
    backgroundColor: 'var(--surface, white)',
    borderRadius: 'var(--border-radius-md, 8px)',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--spacing-lg, 24px)',
    borderBottom: '1px solid var(--border, #e0e0e0)',
    background: 'linear-gradient(135deg, var(--primary, #007bff) 0%, var(--primary-dark, #0056b3) 100%)',
    color: 'white'
  };

  const closeButtonStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    transition: 'background-color 0.2s'
  };

  return (
    <div className="events-page">
      {/* Pass user from auth service to Header */}
      <Header 
        title="Events Management" 
        user={user}
        onLogout={handleLogout} // Optional: add logout functionality to Header
      />
      
      {showSuccess && (
        <div className="success-alert">
          <span className="success-icon">✅</span>
          {successMessage}
          <button className="close-alert" onClick={() => setShowSuccess(false)}>×</button>
        </div>
      )}

      {error && (
        <div className="error-alert">
          <span className="error-icon">❌</span>
          <div className="error-content">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button className="close-alert" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className="page-actions">
        <div className="filter-section">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            📋 All Events ({getAllEventsCount()})
          </button>
          <button 
            className={`filter-button ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleFilterChange('upcoming')}
          >
            🔜 Upcoming ({getUpcomingEventsCount()})
          </button>
          <button 
            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('completed')}
          >
            ✅ Completed ({getCompletedEventsCount()})
          </button>
        </div>
        
        <div className="action-buttons">
          {activeView === 'list' && (
            <button className="add-button" onClick={handleAddEvent}>
              <span className="add-emoji">➕</span>
              Add Event
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="loading-indicator">
          <span className="loading-spinner">⏳</span>
          Loading events...
        </div>
      ) : (
        <div className="events-content">
          {activeView === 'list' && (
            <>
              {filteredEvents.length === 0 && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p>
                    {filter === 'upcoming' && 'No upcoming events found.'}
                    {filter === 'completed' && 'No completed events found.'}
                    {filter === 'all' && 'No events found.'}
                  </p>
                  {filter !== 'all' && (
                    <button className="view-all-button" onClick={() => handleFilterChange('all')}>
                      View All Events
                    </button>
                  )}
                </div>
              )}
              
              {filteredEvents.length > 0 && (
                <EventList 
                  events={filteredEvents}
                  onEdit={handleEditEvent} 
                  onView={handleViewEvent}
                  onDelete={handleDeleteEvent}
                />
              )}
            </>
          )}

          {(activeView === 'add' || activeView === 'edit') && (
            <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                <div style={modalHeaderStyle}>
                  <h2>{activeView === 'add' ? '➕ Add Event' : '✏️ Edit Event'}</h2>
                  <button style={closeButtonStyle} onClick={handleCloseForm}>×</button>
                </div>
                
                <EventForm 
                  event={selectedEvent} 
                  onSubmit={handleSaveEvent} 
                  onCancel={handleCloseForm}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {activeView === 'view' && selectedEvent && (
            <div style={modalOverlayStyle}>
              <EventDetails 
                eventId={selectedEvent._id} 
                onClose={handleCloseForm}
                onEdit={handleEditEvent}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsPage;