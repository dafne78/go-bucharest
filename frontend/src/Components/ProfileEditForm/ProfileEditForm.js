import React, { useState } from 'react';
import { event_categories } from '../../assets/events';
import './ProfileEditForm.css';
import { FaSave, FaTimes } from 'react-icons/fa';

const ProfileEditForm = ({ user, onSave, onCancel }) => {
  // Get interests from event categories
  const categoryTags = event_categories.reduce((allTags, category) => {
    return [...allTags, ...category.tags];
  }, []);

  // Remove duplicates and capitalize first letter
  const uniqueTags = [...new Set(categoryTags)].map(
    tag => tag.charAt(0).toUpperCase() + tag.slice(1)
  );

  // States for form fields
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    bio: user.bio || '',
    interests: [...user.interests] || [],
    newInterest: '' // For adding custom interests
  });

  // Handle field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox-es for interests
  const handleInterestToggle = (interest) => {
    let updatedInterests;
    if (formData.interests.includes(interest)) {
      updatedInterests = formData.interests.filter(i => i !== interest);
    } else {
      updatedInterests = [...formData.interests, interest];
    }

    setFormData({
      ...formData,
      interests: updatedInterests
    });
  };

  // Add custom interest
  const handleAddInterest = () => {
    if (formData.newInterest.trim() && !formData.interests.includes(formData.newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, formData.newInterest.trim()],
        newInterest: ''
      });
    }
  };

  // Remove interest
  const handleRemoveInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  // Handle Enter key press for adding new interest
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="profile-edit-form-container">
      <h2 className="form-title">Edit Your Profile</h2>
      
      <form onSubmit={handleSubmit} className="profile-edit-form">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>
        
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="form-control"
          />
          <small className="form-text">Your email will not be displayed publicly</small>
        </div>
        
        {/* Bio/Description */}
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows="4"
            className="form-control"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>
        
        {/* Selected interests */}
        <div className="form-group">
          <label>Your Interests</label>
          <div className="selected-interests">
            {formData.interests.length > 0 ? (
              <div className="interests-tags">
                {formData.interests.map((interest) => (
                  <div key={interest} className="interest-tag">
                    <span>{interest}</span>
                    <button 
                      type="button" 
                      className="remove-tag-btn" 
                      onClick={() => handleRemoveInterest(interest)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-interests">No interests selected yet. Select from below or add your own.</p>
            )}
          </div>
        </div>
        
        {/* Add custom interest */}
        <div className="form-group">
          <label htmlFor="newInterest">Add Custom Interest</label>
          <div className="add-interest-group">
            <input
              type="text"
              id="newInterest"
              name="newInterest"
              value={formData.newInterest}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="form-control"
              placeholder="Type and press Enter or Add"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="add-interest-btn"
              disabled={!formData.newInterest.trim()}
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Select interests from categories */}
        <div className="form-group">
          <label>Select from Popular Interests</label>
          <div className="interests-options">
            {uniqueTags.map((tag) => (
              <div key={tag} className="interest-option">
                <input
                  type="checkbox"
                  id={`tag-${tag}`}
                  checked={formData.interests.includes(tag)}
                  onChange={() => handleInterestToggle(tag)}
                  className="interest-checkbox"
                />
                <label htmlFor={`tag-${tag}`} className={formData.interests.includes(tag) ? 'selected' : ''}>
                  {tag}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            <FaTimes /> Cancel
          </button>
          <button type="submit" className="save-btn">
            <FaSave /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;