import React, { useState, useEffect } from 'react';
// import userService from '../../../services/userService';
import './UserForm.css';

const UserForm = ({ user, onSubmit, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when field changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling is managed by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete user "${formData.name}"?`)) {
      try {
        await onDelete(user);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="user-form-container">
      <form className="user-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                <span className="label-emoji">👤</span>
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter user name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                <span className="label-emoji">📧</span>
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">
                <span className="label-emoji">🏷️</span>
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          {user && onDelete && (
            <button 
              type="button" 
              className="delete-button" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              <span className="button-emoji">🗑️</span>
              Delete User
            </button>
          )}
          
          <div className="form-actions-right">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <span className="button-emoji">❌</span>
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="button-emoji">{user ? '💾' : '👤'}</span>
                  {user ? 'Update User' : 'Add User'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;