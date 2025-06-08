// /admin/src/pages/TagsPage/TagsPage.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header/Header';
import TagList from '../../components/tag/TagList/TagList';
import TagForm from '../../components/tag/TagForm/TagForm';
import tagService from '../../services/tagService';
import authService from '../../services/authService';
import './TagsPage.css';

const TagsPage = () => {
  // Get user from auth service
  const [user, setUser] = useState(authService.getUser());

  const [activeView, setActiveView] = useState('list');
  const [selectedTag, setSelectedTag] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Check authentication on component mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    // Update user state
    const currentUser = authService.getUser();
    setUser(currentUser);
    console.log('Current user in EventsPage:', currentUser);
  }, []);

  const handleAddTag = () => {
    setSelectedTag(null);
    setActiveView('add');
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setActiveView('edit');
  };

  const handleCloseForm = () => {
    setActiveView('list');
    setSelectedTag(null);
    setError(null);
  };

  const handleSaveTag = async (tagData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (selectedTag) {
        // Update existing tag
        await tagService.updateTag(selectedTag.id, tagData);
        setSuccessMessage('Tag updated successfully!');
      } else {
        // Add new tag
        await tagService.createTag(tagData);
        setSuccessMessage('Tag added successfully!');
      }
      
      // Show success message
      setShowSuccess(true);
      
      // Close success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Return to list
      setActiveView('list');
    } catch (error) {
      console.error('Error saving tag:', error);
      setError(error.message || 'Could not save the tag. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    if (authService.logout) {
      authService.logout();
    }
    window.location.href = '/login';
  };

  return (
    <div className="tags-page">
      <Header title="Tags Management" 
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
          <button className="add-button" onClick={handleAddTag}>
            <span className="add-emoji">➕</span>
            Add Tag
          </button>
        )}
      </div>
      
      <div className="tags-content">
        {activeView === 'list' && (
          <TagList onEdit={handleEditTag} />
        )}
        
        {(activeView === 'add' || activeView === 'edit') && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{activeView === 'add' ? 'Add Tag' : 'Edit Tag'}</h2>
                <button className="close-button" onClick={handleCloseForm}>×</button>
              </div>
              
              {error && (
                <div className="error-alert modal-error">
                  <span className="error-icon">❌</span>
                  {error}
                </div>
              )}
              
              <TagForm 
                tag={selectedTag} 
                onSubmit={handleSaveTag} 
                onCancel={handleCloseForm}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsPage;