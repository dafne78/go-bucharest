// /admin/src/components/tag/TagList/TagList.js
import React, { useState } from 'react';
import Table from '../../common/Table/Table';

const TagList = ({ tags, onEdit, fetchTags }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const handleEditTag = async (tag) => {
    try {
      if (onEdit) {
        onEdit(tag);
      }
    } catch (error) {
      console.error('Error editing tag:', error);
      setError('Could not edit the tag. Please try again.');
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
      label: 'Edit',
      onClick: handleEditTag
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
          </div>
        </div>
        <div className="list-actions">
          <button className="refresh-button" onClick={fetchTags}>
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
            <p>{error}</p>
            <button className="retry-button" onClick={fetchTags}>Try Again</button>
          </div>
        ) : (
          <>
            <div className="list-stats">
              <span className="stats-total">Total: <strong>{filteredTags.length}</strong> tags</span>
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