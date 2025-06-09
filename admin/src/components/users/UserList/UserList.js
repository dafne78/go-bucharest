import React, { useState } from 'react';
import Table from '../../common/Table/Table';
import './UserList.css';

const UserList = ({ onEdit, onView, fetchUsers, users, setUsers }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

  const columns = [
    { 
      header: 'Name', 
      accessor: 'name',
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
      render: (value) => value || 'No email'
    },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (value) => value || 'user'
    },
    { 
      header: 'Created', 
      accessor: 'createdAt',
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Users</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchUsers}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="list-header">
        <div className="list-actions">
          <button className="refresh-button" onClick={fetchUsers}>
            <i className="refresh-icon"></i>
            Refresh
          </button>
        </div>
      </div>

      <div className="list-content">
        <div className="list-stats">
          <span className="stats-total">Total: <strong>{users.length}</strong> users</span>
        </div>

        {users.length > 0 ? (
          <Table 
            columns={columns} 
            data={users} 
            actions={actions}
            keyField="_id"
          />
        ) : (
          <div className="no-results">
            <p>No users available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;