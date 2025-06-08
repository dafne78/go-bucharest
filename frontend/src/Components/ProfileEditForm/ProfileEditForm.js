import React, { useState } from 'react';
import { event_categories } from '../../assets/events';
import './ProfileEditForm.css';
import { FaSave, FaTimes } from 'react-icons/fa';

const ProfileEditForm = ({ user, onSave, onCancel }) => {
  // Preluăm interesele din categoriile de evenimente
  const categoryTags = event_categories.reduce((allTags, category) => {
    return [...allTags, ...category.tags];
  }, []);

  // Eliminarea duplicatelor și capitalizarea primei litere
  const uniqueTags = [...new Set(categoryTags)].map(
    tag => tag.charAt(0).toUpperCase() + tag.slice(1)
  );

  // State-uri pentru câmpurile formularului
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    bio: user.bio || '',
    interests: [...user.interests] || [],
    newInterest: '' // Pentru a adăuga interese personalizate
  });

  // Gestionare schimbări în câmpuri
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Gestionare checkbox-uri pentru interese
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

  // Adăugare interes personalizat
  const handleAddInterest = () => {
    if (formData.newInterest.trim() && !formData.interests.includes(formData.newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, formData.newInterest.trim()],
        newInterest: ''
      });
    }
  };

  // Eliminare interes
  const handleRemoveInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  // Gestionare apăsare Enter pentru adăugare interes nou
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  // Gestionare submit formular
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="profile-edit-form-container">
      <h2 className="form-title">Edit Your Profile</h2>
      
      <form onSubmit={handleSubmit} className="profile-edit-form">
        {/* Nume */}
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
        
        {/* Bio/Descriere */}
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
        
        {/* Interese selectate */}
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
        
        {/* Adăugare interes personalizat */}
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
        
        {/* Selecție interese din categorii */}
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
        
        {/* Butoane acțiuni */}
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