import React, { useState, useEffect } from 'react';
import './Events.css';
import EventCard from '../../Components/EventCard/EventCard';
import { FaCalendarAlt, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';
import apiService from '../../services/apiService';

const EventsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events, categories and zones from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch events
        const eventsResponse = await apiService.get('/events');
        if (eventsResponse.success && eventsResponse.data) {
          setEvents(eventsResponse.data);
        } else {
          throw new Error('Failed to fetch events');
        }

        // Fetch categories
        const categoriesResponse = await apiService.get('/event-categories');
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        } else {
          throw new Error('Failed to fetch categories');
        }

        // Fetch zones
        const zonesResponse = await apiService.get('/location-zones');
        if (zonesResponse.success && zonesResponse.data) {
          setZones(zonesResponse.data);
        } else {
          throw new Error('Failed to fetch zones');
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

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    const categoryMatch = activeCategory === 'All' || 
      (event.categoryDetails && event.categoryDetails.some(cat => cat.category_name === activeCategory));

    const locationMatch = locationFilter === 'all' || 
      (event.zoneDetails && event.zoneDetails.id === locationFilter);

    const dateMatch = (() => {
      if (dateFilter === 'all') return true;
      
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const weekend = new Date(today);
      weekend.setDate(weekend.getDate() + (6 - weekend.getDay()));
      
      const week = new Date(today);
      week.setDate(week.getDate() + 7);
      
      const month = new Date(today);
      month.setMonth(month.getMonth() + 1);
      
      switch (dateFilter) {
        case 'today':
          return eventDate.toDateString() === today.toDateString();
        case 'weekend':
          return eventDate >= today && eventDate <= weekend;
        case 'week':
          return eventDate >= today && eventDate <= week;
        case 'month':
          return eventDate >= today && eventDate <= month;
        default:
          return true;
      }
    })();

    return categoryMatch && locationMatch && dateMatch;
  });

  // Log the zones data when it changes
  useEffect(() => {
    console.log('Available zones:', zones);
  }, [zones]);

  // Log the selected location filter when it changes
  useEffect(() => {
    console.log('Selected location filter:', locationFilter);
  }, [locationFilter]);

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
    <div className="events-container">
      {/* Hero Section */}
      <div className="events-hero">
        <h1>Events in Bucharest</h1>
        <p>Discover the best nightlife experiences in the city</p>
      </div>

      {/* Filter Section */}
      <section className="events-filter-section">
        <div className="filter-header">
          <FaFilter className="filter-icon" />
          <h2>Filter Events</h2>
        </div>
        
        <div className="filter-options">
          {/* Date Filter */}
          <div className="filter-group">
            <label htmlFor="date">
              <FaCalendarAlt className="filter-sub-icon" />
              Date
            </label>
            <select 
              id="date" 
              className="filter-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="weekend">This Weekend</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="filter-group">
            <label htmlFor="location">
              <FaMapMarkerAlt className="filter-sub-icon" />
              Location
            </label>
            <select 
              id="location" 
              className="filter-select"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Areas</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label htmlFor="category">
              <FaFilter className="filter-sub-icon" />
              Category
            </label>
            <div className="category-tags">
              <button
                className={`category-tag ${activeCategory === 'All' ? 'active' : ''}`}
                onClick={() => setActiveCategory('All')}
              >
                All
              </button>
              
              {categories.map(category => (
                <button
                  key={category._id}
                  className={`category-tag ${activeCategory === category.category_name ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.category_name)}
                >
                  {category.category_name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="events-grid-section">
        <h2 className="section-title">
          {activeCategory === 'All' ? 'All Events' : `${activeCategory} Events`}
        </h2>
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
        {filteredEvents.length === 0 && (
          <p className="no-events-message">No events found in this category.</p>
        )}
      </section>
    </div>
  );
};

export default EventsPage;