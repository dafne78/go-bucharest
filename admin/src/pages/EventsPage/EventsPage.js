import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header/Header';
import authService from '../../services/authService';
import eventService from '../../services/eventsService';
import './Events.css';
import EventForm from '../../components/events/EventForm/EventForm';
import EventDetails from '../../components/events/EventDetails/EventDetails';
import EventList from '../../components/events/EventList/EventList';

const EventsPage = () => {
  const [user, setUser] = useState(authService.getUser());
  const [events, setEvents] = useState([]);
  const [activeView, setActiveView] = useState('list');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setError(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setActiveView('edit');
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setActiveView('list');
    setSelectedEvent(null);
    setError(null);
    setIsModalOpen(false);
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.name}"?`)) {
      try {
        await eventService.deleteEvent(event._id);
        
        // Remove the deleted event from the state
        const updatedEvents = events.filter(e => e._id !== event._id);
        setEvents(updatedEvents);
        
        showSuccessMessage('Event deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        setError(error.message || 'Failed to delete event');
      }
    }
  };

  const handleSaveEvent = async (eventData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let updatedEvents;
      
      if (selectedEvent) {
        // Update existing Event
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
      
      // Show success message
      setShowSuccess(true);
      
      // Close success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Return to list
      handleCloseForm();
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error.message || 'Could not save the event. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      
      const response = await eventService.getEvents(); // Get all events
      console.log('API Response:', response);
      
      if (response.success) {
        setEvents(response.data);
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

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

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

  return (
    <div className="events-page">
      <Header 
        title="Events Management" 
        handleAdd={handleAddEvent}
        handleAddText = "Add New Event"
      />
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : (
        <div className="events-content">
          {activeView === 'list' && (
            <>
              {events.length === 0 && !loading && (
                <div className="empty-state">
                  <p>No events found.</p>
                </div>
              )}
              
              {events.length > 0 && (
                <EventList
                  events={events}
                  onEdit={handleEditEvent}
                  setEvents={setEvents}
                />
              )}
            </>
          )}

          {(activeView === 'add' || activeView === 'edit') && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>
                    {activeView === 'add' ? 'Add New Event' : 'Edit Event'}
                  </h2>
                  <button className="close-button" onClick={handleCloseForm}>×</button>
                </div>
              
                {error && (
                  <div className="error-alert modal-error">
                    <span className="error-icon">❌</span>
                    {error}
                  </div>
                )}
                
                <EventForm
                  event={selectedEvent}
                  onSubmit={handleSaveEvent}
                  onCancel={handleCloseForm}
                  onDelete={selectedEvent ? handleDeleteEvent : null}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsPage;