import React, { useState } from 'react';
import Table from '../../common/Table/Table';
import './UserList.css';

const UserList = ({ onEdit, onView, fetchUsers, users, setUsers }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle null/undefined values
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const filteredUsers = sortedUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchLower));
    
    return matchesSearch;
  });

  const columns = [
    { 
      header: 'Name', 
      accessor: 'name',
      sortable: true,
      render: (value, user) => (
        <div className="user-name-cell">
          <div className="user-avatar">
            <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
          </div>
          <div className="user-info">
            <div className="user-name">{user.name || 'No name'}</div>
            <div className="user-role">{user.role || 'user'}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Email', 
      accessor: 'email',
      sortable: true,
      render: (value) => value || 'No email'
    },
    { 
      header: 'Role', 
      accessor: 'role',
      sortable: true,
      render: (value) => value || 'user'
    },
    { 
      header: 'Created', 
      accessor: 'createdAt',
      sortable: true,
      render: (value) => formatDate(value)
    }
  ];

  const actions = [
    { 
      type: 'edit',
      label: 'Edit User',
      onClick: onEdit
    }
  ];

  return (
    <div className="user-list">
      <div className="list-header">
        <div className="search-filter">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="list-actions">
          <button className="refresh-button" onClick={fetchUsers}>
            Refresh
          </button>
        </div>
      </div>

      <div className="list-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button className="retry-button" onClick={fetchUsers}>Try Again</button>
          </div>
        ) : (
          <>
            <div className="list-stats">
              <span className="stats-total">Total: <strong>{filteredUsers.length}</strong> users</span>
            </div>

            {filteredUsers.length > 0 ? (
              <Table 
                columns={columns} 
                data={filteredUsers} 
                actions={actions}
                onSort={requestSort}
                sortConfig={sortConfig}
                keyField="_id"
              />
            ) : (
              <div className="no-results">
                {searchTerm ? (
                  <p>No users found matching your search criteria.</p>
                ) : (
                  <p>No users available.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;