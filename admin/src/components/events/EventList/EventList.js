// /src/components/event/EventList/EventList.js
import React, { useState, useEffect } from 'react';
import eventService from '../../../services/eventsService';
import Table from '../../common/Table/Table';
import './EventList.css';

const EventList = ({ onEdit, events, setEvents }) => {
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
            {formatDate(value)}
          </div>
          <div className="time-display">
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
              <span className="venue-text">{value.exact}</span>
            </div>
          )}
          {row.zoneDetails && (
            <div className="zone-display" title={row.zoneDetails.name}>
              <span className="zone-text">{row.zoneDetails.name}</span>
            </div>
          )}
          {!value?.exact && !row.zoneDetails && (
            <div className="zone-display">
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
                {value.length} {value.length === 1 ? 'category' : 'categories'}
              </div>
              <div className="categories-list" title={value.map(cat => cat.category_name || cat.name).join(', ')}>
                {value.map(cat => cat.category_name || cat.name).join(', ')}
              </div>
            </>
          ) : (
            <div className="no-categories">
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
          <span className="reviews-count">{value ? value.length : 0}</span>
        </div>
      )
    }
  ];

  const actions = [
    { 
      type: 'edit', 
      label: 'Edit',
      onClick: onEdit
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  const StatusFilterMenu = () => (
    <div className="filter-menu">
      <div 
        className={`filter-option ${statusFilter === 'all' ? 'active' : ''}`}
        onClick={() => {
          setStatusFilter('all');
          setShowStatusFilter(false);
        }}
      >
        All Events
      </div>
      <div 
        className={`filter-option ${statusFilter === 'upcoming' ? 'active' : ''}`}
        onClick={() => {
          setStatusFilter('upcoming');
          setShowStatusFilter(false);
        }}
      >
        Upcoming
      </div>
      <div 
        className={`filter-option ${statusFilter === 'completed' ? 'active' : ''}`}
        onClick={() => {
          setStatusFilter('completed');
          setShowStatusFilter(false);
        }}
      >
        Completed
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
          </div>
        </div>
        <div className="filter-dropdown">
            <button 
              className={`filter-button ${showStatusFilter ? 'active' : ''}`}
              onClick={() => setShowStatusFilter(!showStatusFilter)}
            >
              {statusFilter === 'all' ? 'All Events' : 
               statusFilter === 'upcoming' ? 'Upcoming Events' : 'Completed Events'}
            </button>
            {showStatusFilter && <StatusFilterMenu />}
        </div>
        <div className="list-actions">
          <button className="refresh-button" onClick={fetchEvents}>
          <i className="refresh-icon"></i>
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button className="retry-button" onClick={fetchEvents}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="list-stats">
            <span className="stats-total">Total: <strong>{filteredEvents.length}</strong> events</span>
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
              <p>No events found matching your search criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventList;