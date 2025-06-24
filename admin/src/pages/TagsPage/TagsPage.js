// /admin/src/pages/TagsPage/TagsPage.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header/Header';
import TagList from '../../components/tag/TagList/TagList';
import TagForm from '../../components/tag/TagForm/TagForm';
import tagService from '../../services/tagService';
import './TagsPage.css';

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [activeView, setActiveView] = useState('list');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tagService.getAllTags();
      if (response.success) {
        setTags(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load tags');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    setEditingTag(null);
    setActiveView('add');
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setActiveView('edit');
  };

  
  const handleCloseForm = () => {
    setActiveView('list');
    setEditingTag(null);
    setError(null);
  };

  const handleDeleteTag = async (tag) => {
    if (window.confirm(`Are you sure you want to delete "${tag.name}"?`)) {
      try {
        await tagService.deleteTag(tag.id);
        const updatedTags = tags.filter(t => t.id !== tag.id);
        setTags(updatedTags);
        showSuccessMessage('Tag deleted successfully!');
        handleCloseForm();
      } catch (error) {
        console.error('Error deleting tag:', error);
        setError(error.message || 'Failed to delete tag');
      }
    }
  };

    // Show success message with auto-hide
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleSaveTag = async (tagData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let updatedTags;
      
      if (editingTag) {
        // Update existing tag
        const response = await tagService.updateTag(editingTag.id, tagData);
        setSuccessMessage('Tag updated successfully!');
        
        // Update the tag in the state using response data
        updatedTags = tags.map(tag => 
          tag.id === editingTag.id 
            ? response.data 
            : tag
        );
      } else {
        // Add new tag
        const response = await tagService.createTag(tagData);
        setSuccessMessage('Tag added successfully!');
        
        // Add the new tag to the state using response data
        updatedTags = [...tags, response.data];
      }
      
      setTags(updatedTags);
      
      // Show success message
      setShowSuccess(true);
      
      // Close success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Return to list
      handleCloseForm();
    } catch (error) {
      console.error('Error saving tag:', error);
      setError(error.message || 'Could not save the tag. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    setError('');
  };

  return (
    <div className="tags-page">
      <Header
        title="Tags Management"
        handleAdd={handleAddTag}
        handleAddText="Add New Tag"
      />
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tags...</p>
        </div>
      ) : (
        <div className="tags-content">
          {activeView === 'list' && (
            <>
              {showSuccess && (
                <div className="success-alert">
                  {successMessage}
                </div>
              )}
              {tags.length === 0 && !loading && (
                <div className="empty-state">
                  <p>No tags found.</p>
                </div>
              )}
                <TagList
                  tags={tags}
                  onEdit={handleEditTag}
                  fetchTags={fetchTags}
                />
            </>
          )}
          {(activeView === 'add' || activeView === 'edit') && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>
                    {editingTag ? 'Edit Tag' : 'Add New Tag'}
                  </h2>
                  <button className="close-button" onClick={handleCloseForm}>×</button>
                </div>
              
              {error && (
                <div className="error-alert modal-error">
                  <span className="error-icon">❌</span>
                  {error}
                </div>
              )}
              
                <TagForm
                  tag={editingTag}
                  onSubmit={handleSaveTag}
                  onCancel={handleCloseForm}
                  onDelete={editingTag ? handleDeleteTag : null}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagsPage;