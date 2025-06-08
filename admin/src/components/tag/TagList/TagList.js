// /admin/src/components/tag/TagList/TagList.js
import React, { useState, useEffect } from 'react';
import tagService from '../../../services/tagService';
import Table from '../../common/Table/Table';
import './TagList.css';

const TagList = ({ onEdit, onView }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tagService.getAllTags();
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Could not load tags. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tag) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await tagService.deleteTag(tag.id);
        setTags(tags.filter(t => t.id !== tag.id));
      } catch (error) {
        console.error('Error deleting tag:', error);
        alert('Could not delete the tag. Please try again.');
      }
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const sortedTags = React.useMemo(() => {
    let sortableTags = [...tags];
    if (sortConfig.key) {
      sortableTags.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTags;
  }, [tags, sortConfig]);

  const filteredTags = sortedTags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'Name', 
      accessor: 'name',
      sortable: true
    },
    { 
      header: 'Created At', 
      accessor: 'createdAt',
      sortable: true,
      render: (value) => formatDate(value)
    },
    { 
      header: 'Updated At', 
      accessor: 'updatedAt',
      sortable: true,
      render: (value) => formatDate(value)
    }
  ];

  const actions = [
    { 
      type: 'edit', 
      emoji: '✏️', 
      label: 'Edit',
      onClick: onEdit
    },
    { 
      type: 'delete', 
      emoji: '🗑️', 
      label: 'Delete',
      onClick: handleDeleteTag
    }
  ];

  return (
    <div className="tag-list">
      <div className="list-header">
        <div className="search-filter">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-emoji">🔍</span>
          </div>
        </div>
        <div className="list-actions">
          <button className="refresh-button" onClick={fetchTags}>
            <span className="refresh-emoji">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="list-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tags...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <span className="error-emoji">❌</span>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchTags}>Try Again</button>
          </div>
        ) : (
          <>
            <div className="list-stats">
              <span className="stats-total">Total: <strong>{tags.length}</strong> tags</span>
              <span className="stats-filtered">Displayed: <strong>{filteredTags.length}</strong></span>
            </div>

            {filteredTags.length > 0 ? (
              <Table 
                columns={columns} 
                data={filteredTags} 
                actions={actions}
                onSort={requestSort}
                sortConfig={sortConfig}
              />
            ) : (
              <div className="no-results">
                <span className="no-results-emoji">😔</span>
                <p>No tags found matching your search criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TagList;