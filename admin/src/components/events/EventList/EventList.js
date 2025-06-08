// /src/components/event/EventList/EventList.js
import React, { useState, useEffect } from 'react';
import eventService from '../../../services/eventsService';
import Table from '../../common/Table/Table';
import './EventList.css';

const EventList = ({ onEdit, onView, onDelete }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventService.getEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Could not load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.name}"?`)) {
      try {
        await eventService.deleteEvent(event._id);
        setEvents(events.filter(e => e._id !== event._id));
        if (onDelete) {
          onDelete(event);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Could not delete the event. Please try again.');
      }
    }
  };

  const getEventStatus = (eventDate) => {
    const currentDate = new Date().toISOString().split('T')[0];
    return eventDate > currentDate ? 'upcoming' : 'completed';
  };

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

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedEvents = React.useMemo(() => {
    let sortableEvents = [...events];
    if (sortConfig.key) {
      sortableEvents.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle nested properties
        if (sortConfig.key === 'zone') {
          aValue = a.zoneDetails?.name || '';
          bValue = b.zoneDetails?.name || '';
        } else if (sortConfig.key === 'status') {
          aValue = getEventStatus(a.date);
          bValue = getEventStatus(b.date);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableEvents;
  }, [events, sortConfig]);

  const filteredEvents = sortedEvents.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || getEventStatus(event.date) === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = { all: events.length, upcoming: 0, completed: 0 };
    events.forEach(event => {
      const status = getEventStatus(event.date);
      counts[status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const columns = [
    { 
      header: 'Image', 
      accessor: 'image',
      render: (value, row) => (
        <div className="event-thumbnail">
          {value ? (
            <img src={`${value}`} alt={`${row.name} thumbnail`} />
          ) : (
            <div className="no-image">
              <span className="no-image-emoji">🖼️</span>
              <span className="no-image-text">No image</span>
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'Event Name', 
      accessor: 'name',
      sortable: true,
      render: (value, row) => (
        <div className="event-name-cell">
          <div className="event-name">
            <span className="event-name-emoji">🎉</span>
            {value}
          </div>
          {row.description && (
            <div className="event-description" title={row.description}>
              {row.description}
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'Date & Time', 
      accessor: 'date',
      sortable: true,
      render: (value, row) => (
        <div className="date-time-cell">
          <div className="date-display">
            <span className="date-emoji">📅</span>
            {formatDate(value)}
          </div>
          <div className="time-display">
            <span className="time-emoji">⏰</span>
            {formatTime(row.time)}
          </div>
        </div>
      )
    },
    { 
      header: 'Location', 
      accessor: 'location',
      render: (value, row) => (
        <div className="location-cell">
          {value?.exact && (
            <div className="venue-display" title={value.exact}>
              <span className="location-emoji">🏢</span>
              <span className="venue-text">{value.exact}</span>
            </div>
          )}
          {row.zoneDetails && (
            <div className="zone-display" title={row.zoneDetails.name}>
              <span className="location-emoji">🗺️</span>
              <span className="zone-text">{row.zoneDetails.name}</span>
            </div>
          )}
          {!value?.exact && !row.zoneDetails && (
            <div className="zone-display">
              <span className="location-emoji">📍</span>
              <span className="zone-text">Not specified</span>
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'Cost', 
      accessor: 'cost',
      sortable: true,
      render: (value) => (
        <div className={`cost-display ${value && value > 0 ? 'cost-paid' : 'cost-free'}`}>
          <span className="cost-emoji">💰</span>
          {value && value > 0 ? `${value} RON` : 'Free'}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      sortable: true,
      render: (_, row) => {
        const status = getEventStatus(row.date);
        return (
          <span className={`status-badge ${status}`}>
            <span className="status-emoji">{status === 'upcoming' ? '🔜' : '✅'}</span>
            {status === 'upcoming' ? 'Upcoming' : 'Completed'}
          </span>
        );
      }
    },
    {
      header: 'Categories',
      accessor: 'categoryDetails',
      render: (value) => (
        <div className="categories-display">
          {value && value.length > 0 ? (
            <>
              <div className="categories-count">
                <span className="categories-emoji">📂</span>
                {value.length} {value.length === 1 ? 'category' : 'categories'}
              </div>
              <div className="categories-list" title={value.map(cat => cat.category_name || cat.name).join(', ')}>
                {value.map(cat => cat.category_name || cat.name).join(', ')}
              </div>
            </>
          ) : (
            <div className="no-categories">
              <span className="no-categories-emoji">🚫</span>
              No categories
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Reviews',
      accessor: 'reviews',
      render: (value) => (
        <div className="reviews-display">
          <span className="reviews-emoji">⭐</span>
          <span className="reviews-count">{value ? value.length : 0}</span>
        </div>
      )
    }
  ];

  const actions = [
    { 
      type: 'view', 
      emoji: '👁️', 
      label: 'View Details',
      onClick: onView
    },
    { 
      type: 'edit', 
      emoji: '✏️', 
      label: 'Edit Event',
      onClick: onEdit
    },
    { 
      type: 'delete', 
      emoji: '🗑️', 
      label: 'Delete Event',
      onClick: handleDeleteEvent
    }
  ];

  const StatusFilterMenu = () => (
    <div className="filter-menu">
      <div 
        className={`filter-option ${statusFilter === 'all' ? 'active' : ''}`}
        onClick={() => {
          setStatusFilter('all');
          setShowStatusFilter(false);
        }}
      >
        <span>📋</span>
        All Events ({statusCounts.all})
      </div>
      <div 
        className={`filter-option ${statusFilter === 'upcoming' ? 'active' : ''}`}
        onClick={() => {
          setStatusFilter('upcoming');
          setShowStatusFilter(false);
        }}
      >
        <span>🔜</span>
        Upcoming ({statusCounts.upcoming})
      </div>
      <div 
        className={`filter-option ${statusFilter === 'completed' ? 'active' : ''}`}
        onClick={() => {
          setStatusFilter('completed');
          setShowStatusFilter(false);
        }}
      >
        <span>✅</span>
        Completed ({statusCounts.completed})
      </div>
    </div>
  );

  return (
    <div className="event-list">
      <div className="list-header">
        <div className="search-filter">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-emoji">🔍</span>
          </div>
          
          <div className="filter-dropdown">
            <button 
              className={`filter-button ${showStatusFilter ? 'active' : ''}`}
              onClick={() => setShowStatusFilter(!showStatusFilter)}
            >
              <span className="filter-emoji">🔽</span>
              Status Filter
            </button>
            {showStatusFilter && <StatusFilterMenu />}
          </div>
        </div>
        
        <div className="list-actions">
          <button className="refresh-button" onClick={fetchEvents}>
            <span className="refresh-emoji">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="list-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">
              <span className="loading-emoji">⏳</span>
              Loading events...
            </p>
          </div>
        ) : error ? (
          <div className="error-container">
            <span className="error-emoji">❌</span>
            <p className="error-text">{error}</p>
            <button className="retry-button" onClick={fetchEvents}>
              <span className="retry-emoji">🔄</span>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="list-stats">
              <div className="stats-left">
                <div className="stats-item">
                  <span className="stats-emoji">📊</span>
                  Total: <strong>{events.length}</strong> events
                </div>
                <div className="stats-item">
                  <span className="stats-emoji">👁️</span>
                  Displayed: <strong>{filteredEvents.length}</strong>
                </div>
                <div className="stats-item">
                  <span className="stats-emoji">🔜</span>
                  Upcoming: <strong>{statusCounts.upcoming}</strong>
                </div>
                <div className="stats-item">
                  <span className="stats-emoji">✅</span>
                  Completed: <strong>{statusCounts.completed}</strong>
                </div>
              </div>
            </div>

            {filteredEvents.length > 0 ? (
              <Table 
                columns={columns} 
                data={filteredEvents} 
                actions={actions}
                onSort={requestSort}
                sortConfig={sortConfig}
                keyField="_id"
              />
            ) : (
              <div className="no-results">
                <span className="no-results-emoji">🔍</span>
                <div className="no-results-text">
                  {searchTerm || statusFilter !== 'all' ? (
                    <>
                      <p>No events found matching your search criteria.</p>
                      <button 
                        className="clear-filters-button"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                      >
                        <span className="clear-emoji">🧹</span>
                        Clear Filters
                      </button>
                    </>
                  ) : (
                    <p>No events available. Create your first event to get started!</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventList;