// /admin/src/pages/TagsPage/TagsPage.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header/Header';
import TagList from '../../components/tag/TagList/TagList';
import TagForm from '../../components/tag/TagForm/TagForm';
import tagService from '../../services/tagService';
import authService from '../../services/authService';
import './TagsPage.css';

const TagsPage = () => {
  const [user, setUser] = useState(authService.getUser());
  const [tags, setTags] = useState([]);
  const [activeView, setActiveView] = useState('list');
  const [selectedTag, setSelectedTag] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    const currentUser = authService.getUser();
    setUser(currentUser);
    console.log('Current user in TagsPage:', currentUser);

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
    setIsModalOpen(true);
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const handleSubmit = async (tagData) => {
    setIsLoading(true);
    setError(null);

    try {
      let updatedTags;
      if (editingTag) {
        await tagService.updateTag(editingTag._id, tagData);
        updatedTags = tags.map(tag =>
          tag._id === editingTag._id
            ? { ...tag, ...tagData }
            : tag
        );
      } else {
        const newTag = await tagService.createTag(tagData);
        updatedTags = [...tags, newTag.data || newTag];
      }
      setTags(updatedTags);
      setIsModalOpen(false);
      showSuccessMessage(editingTag ? 'Tag updated successfully!' : 'Tag created successfully!');
      setActiveView('list');
    } catch (error) {
      console.error('Error saving tag:', error);
      setError(error.message || 'Failed to save tag');
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message with auto-hide
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage(''); 
    }, 3000);
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

      {/* Success Message Display */}
      {showSuccess && (
        <div className="success-message-container">
          <p className="success-message">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="error-message-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tags...</p>
        </div>
      ) : (
        <div className="tags-content">
          {activeView === 'list' && (
            <>
              {tags.length === 0 && !loading && (
                <div className="empty-state">
                  <p>No tags found.</p>
                </div>
              )}

              {tags.length > 0 && (
                <TagList
                  tags={tags}
                  onEdit={handleEditTag}
                />
              )}
            </>
          )}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>
                    {editingTag ? 'Edit Tag' : 'Add New Tag'}
                  </h2>
                  <button className="close-button" onClick={closeModal}>×</button>
                </div>
                <TagForm
                  tag={editingTag}
                  onSubmit={handleSubmit}
                  onCancel={closeModal}
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