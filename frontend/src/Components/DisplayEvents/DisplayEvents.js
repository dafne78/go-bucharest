import React, { useState, useEffect } from 'react';
import './DisplayEvents.css';
import HomeEventCard from '../HomeEventCard/HomeEventCard';
import apiService from '../../services/apiService';

const DisplayEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get('/events');
        
        if (response.success && response.data) {
          setEvents(response.data);
        } else {
          throw new Error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error.message || 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="events-loading">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="display-events">
      <div className="events-grid">
        {events.length > 0 ? (
          events.map(event => (
            <HomeEventCard key={event._id} event={event} />
          ))
        ) : (
          <div className="no-events">
            <p>No events available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayEvents;