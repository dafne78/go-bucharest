import React, { useState, useEffect } from 'react';
import UserList from '../../components/users/UserList/UserList';
import UserForm from '../../components/users/UserForm/UserForm';
import userService from '../../services/userService';
import authService from '../../services/authService';
import './Users.css';
import Header from '../../components/common/Header/Header';

const UsersPage = () => {
  const [user, setUser] = useState(authService.getUser());
  const [users, setUsers] = useState([]);
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
    
    // Fetch initial data
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setActiveView('add');
    setError(null);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setActiveView('edit');
    setError(null);
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
      let updatedUsers;
      if (selectedUser) {
        // Update existing user
        const response = await userService.updateUser(selectedUser._id, userData);
        if (!response.success) {
          throw new Error(response.message || 'Failed to update user');
        }
        setSuccessMessage('User updated successfully!');

        // Update the user in the state
        updatedUsers = users.map(user => 
          user._id === selectedUser._id 
            ? { ...user, ...userData } 
            : user
        );
      } else {
        // Add new user
        const response = await userService.createUser(userData);
        if (!response.success) {
          throw new Error(response.message || 'Failed to create user');
        }
        setSuccessMessage('User added successfully!');

        // Add the new user to the state
        updatedUsers = [...users, response.data];
      }
      setUsers(updatedUsers);
      setShowSuccess(true);
      
      // Close success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Return to list view
      setActiveView('list');
      
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.message || 'Could not save the user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userService.getUsers();
      if (!response.success) {
        throw new Error(response.message || 'Failed to load users');
      }
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (window.confirm(`Are you sure you want to delete "${userToDelete.name}"?`)) {
      try {
        setIsLoading(true);
        setError(null);

        const response = await userService.deleteUser(userToDelete._id);
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete user');
        }

        setSuccessMessage('User deleted successfully!');
        setShowSuccess(true);

        // Update users list
        const updatedUsers = users.filter(user => user._id !== userToDelete._id);
        setUsers(updatedUsers);
        
        // Close form and return to list
        setActiveView('list');

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);

      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.message || 'Could not delete the user. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="users-page">      
      <Header 
        title="Users Management" 
        handleAdd={handleAddUser}
        handleAddText="Add New User"
      />
      <div className="users-content">
        {showSuccess && (
          <div className="success-alert">
            <span className="success-icon">✅</span>
            {successMessage}
            <button className="close-alert" onClick={() => setShowSuccess(false)}>×</button>
          </div>
        )}

        {error && (
          <div className="error-alert">
            <span className="error-icon">❌</span>
            {error}
          </div>
        )}

        {activeView === 'list' && (
          <UserList 
            onEdit={handleEditUser}
            key={showSuccess ? 'refresh' : 'normal'}
            fetchUsers={fetchUsers}
            users={users}
            setUsers={setUsers}
          />
        )}
        
        {(activeView === 'add' || activeView === 'edit') && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>
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