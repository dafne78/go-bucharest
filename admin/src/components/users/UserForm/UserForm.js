import React, { useState, useEffect } from 'react';
// import userService from '../../../services/userService';
import './UserForm.css';

const UserForm = ({ user, onSubmit, onCancel, onDelete, isLoading }) => {
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
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    } else if (!['user', 'admin'].includes(formData.role)) {
      newErrors.role = 'Invalid role selected';
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
      setErrors({
        submit: error.message || 'Failed to save user. Please try again.'
      });
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
        setErrors({
          submit: error.message || 'Failed to delete user. Please try again.'
        });
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
                disabled={isLoading || isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
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
                disabled={isLoading || isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">
                Role <span className="required">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={errors.role ? 'error' : ''}
                disabled={isLoading || isSubmitting}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <span className="error-message">{errors.role}</span>}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="form-error">
            {errors.submit}
          </div>
        )}
        
        <div className="form-actions">
          {user && onDelete && (
            <button 
              type="button" 
              className="delete-button" 
              onClick={handleDelete}
              disabled={isLoading || isSubmitting}
            >
              Delete User
            </button>
          )}
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <>
                  <span className="button-spinner"></span>
                  Saving...
                </>
              ) : (
                user ? 'Update User' : 'Add User'
              )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;