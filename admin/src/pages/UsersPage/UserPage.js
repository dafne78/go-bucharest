import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header/Header';
import UserList from '../../components/users/UserList/UserList';
import UserForm from '../../components/users/UserForm/UserForm';
import userService from '../../services/userService';
import authService from '../../services/authService';
import './Users.css';

const UsersPage = () => {
  const [user, setUser] = useState(authService.getUser());
  const [activeView, setActiveView] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check authentication on component mount
    if (!authService.isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    // Update user state
    const currentUser = authService.getUser();
    setUser(currentUser);
    console.log('Current user in UsersPage:', currentUser);
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setActiveView('add');
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setActiveView('edit');
  };

  const handleViewUser = (user) => {
    console.log('View user:', user);
    // Aici poți implementa o pagină de detalii
    // navigate(`/users/${user.id}`);
  };

  const handleCloseForm = () => {
    setActiveView('list');
    setSelectedUser(null);
    setError(null);
  };

  const handleSaveUser = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (selectedUser) {
        // Update existing user
        await userService.updateUser(selectedUser.id, userData);
        setSuccessMessage('User updated successfully!');
      } else {
        // Add new user
        await userService.createUser(userData);
        setSuccessMessage('User added successfully!');
      }
      
      // Show success message
      setShowSuccess(true);
      
      // Close success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Return to list and refresh data
      setActiveView('list');
      
      // Trigger refresh of UserList component
      // This will be handled by UserList's internal refresh
      
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.message || 'Could not save the user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    try {
      await userService.deleteUser(userToDelete.id);
      setSuccessMessage('User deleted successfully!');
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Close form and return to list
      setActiveView('list');
      
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Could not delete the user. Please try again.');
    }
  };

  const handleLogout = () => {
    if (authService.logout) {
      authService.logout();
    }
    window.location.href = '/login';
  };

  return (
    <div className="users-page">
      <Header 
        title="Users Management" 
        user={user}
        onLogout={handleLogout}
      />
      
      {showSuccess && (
        <div className="success-alert">
          <span className="success-icon">✅</span>
          {successMessage}
          <button className="close-alert" onClick={() => setShowSuccess(false)}>×</button>
        </div>
      )}
      
      <div className="page-actions">
        {activeView === 'list' && (
          <div className="action-buttons">
            <button className="add-button" onClick={handleAddUser}>
              <i className="add-icon"></i>
              Add New User
            </button>
          </div>
        )}
      </div>
      
      <div className="users-content">
        {activeView === 'list' && (
          <UserList 
            onEdit={handleEditUser}
            onView={handleViewUser}
            key={showSuccess ? 'refresh' : 'normal'} // Force refresh after success
          />
        )}
        
        {(activeView === 'add' || activeView === 'edit') && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  <span className="modal-emoji">{activeView === 'add' ? '👤' : '✏️'}</span>
                  {activeView === 'add' ? 'Add User' : 'Edit User'}
                </h2>
                <button className="close-button" onClick={handleCloseForm}>×</button>
              </div>
              
              {error && (
                <div className="error-alert modal-error">
                  <span className="error-icon">❌</span>
                  {error}
                </div>
              )}
              
              <UserForm 
                user={selectedUser} 
                onSubmit={handleSaveUser} 
                onCancel={handleCloseForm}
                onDelete={selectedUser ? handleDeleteUser : null}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;