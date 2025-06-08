import React, { useState, useEffect } from 'react';
import userService from '../../../services/userService';
import Table from '../../common/Table/Table';
import './UserList.css';

const UserList = ({ onEdit, onView }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.getUsers();
      console.log('Users API Response:', response);

      if (response.success) {
        setUsers(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name || user.email}"?`)) {
      try {
        const response = await userService.deleteUser(user.id);
        
        if (response.success) {
          setUsers(users.filter(u => u.id !== user.id));
          console.log('User deleted successfully');
        } else {
          throw new Error(response.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
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
      type: 'view', 
      icon: 'view-icon', 
      label: 'View User',
      onClick: onView
    },
    { 
      type: 'edit', 
      icon: 'edit-icon', 
      label: 'Edit User',
      onClick: onEdit
    },
    { 
      type: 'delete', 
      icon: 'delete-icon', 
      label: 'Delete User',
      onClick: handleDeleteUser
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
            keyField="id"
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