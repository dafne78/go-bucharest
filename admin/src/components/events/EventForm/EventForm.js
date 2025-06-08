// /src/components/event/EventForm/EventForm.js
import React, { useState, useEffect } from 'react';
import eventService from '../../../services/eventsService';
import categoryService from '../../../services/categoryService';
import locationService from '../../../services/locationService';
import imageService from '../../../services/imageService';
import './EventForm.css';

const EventForm = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    cost: '',
    image: null,
    categories: [],
    location: {
      exact: '',
      zone: '',
      latitude: '',
      longitude: ''
    }
  });
  
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableZones, setAvailableZones] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        cost: event.cost || '',
        categories: event.categories || [],
        location: {
          exact: event.location?.exact || '',
          zone: event.location?.zone || '',
          latitude: event.location?.latitude || '',
          longitude: event.location?.longitude || ''
        },
        image: null // Don't load existing image, just show preview
      });
      
      setPreviewImage(event.image || '');
    }
  }, [event]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [categoriesResponse, zonesResponse] = await Promise.all([
        categoryService.getAllCategories(),
        locationService.getAllLocations()
      ]);
      
      setAvailableCategories(categoriesResponse.data || []);
      setAvailableZones(zonesResponse.data || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear errors when field changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleCategoriesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      categories: selectedOptions
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        image: 'Please select a valid image file'
      }));
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: 'Image size must be less than 5MB'
      }));
      return;
    }
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      image: file
    }));
    
    // Clear image errors
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: null
      }));
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      // Check if date is in the past
      const eventDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        newErrors.date = 'Event date cannot be in the past';
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'Event time is required';
    }
    
    if (!formData.location.zone) {
      newErrors['location.zone'] = 'Zone is required';
    }
    
    // Cost validation
    if (formData.cost && (isNaN(formData.cost) || formData.cost < 0)) {
      newErrors.cost = 'Cost must be a valid positive number';
    }
    
    // Coordinates validation (if provided)
    if (formData.location.latitude && (isNaN(formData.location.latitude) || Math.abs(formData.location.latitude) > 90)) {
      newErrors['location.latitude'] = 'Latitude must be between -90 and 90';
    }
    
    if (formData.location.longitude && (isNaN(formData.location.longitude) || Math.abs(formData.location.longitude) > 180)) {
      newErrors['location.longitude'] = 'Longitude must be between -180 and 180';
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
      // Prepare data for submission
      const eventData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        categories: formData.categories,
        location: {
          exact: formData.location.exact.trim(),
          zone: formData.location.zone,
          latitude: formData.location.latitude ? parseFloat(formData.location.latitude) : null,
          longitude: formData.location.longitude ? parseFloat(formData.location.longitude) : null
        }
      };
      
      if (formData.image) {
        try {
          const uploadedImage = await imageService.upload(formData.image, 'events');
          eventData.image = uploadedImage.url;  
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setErrors(prev => ({
            ...prev,
            image: 'Failed to upload image. Please try again.'
          }));
          setIsSubmitting(false);
          return;
        }
      }
      
      await onSubmit(eventData);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling is managed by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <div className="event-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-form-container">
      <form className="event-form" onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="form-section">
          <div className="section-header">
            <span className="section-emoji">📝</span>
            <h3 className="section-title">Basic Information</h3>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                <span className="label-emoji">🎉</span>
                Event Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter event name"
                maxLength="100"
              />
              {errors.name && (
                <span className="error-message">
                  <span className="error-emoji">❌</span>
                  {errors.name}
                </span>
              )}
            </div>
          </div>
          
          <div className="form-row single">
            <div className="form-group full-width">
              <label htmlFor="description">
                <span className="label-emoji">📄</span>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                maxLength="1000"
              />
              <small className="help-text">
                <span className="help-emoji">💡</span>
                Provide a detailed description of your event
              </small>
            </div>
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="form-section">
          <div className="section-header">
            <span className="section-emoji">📅</span>
            <h3 className="section-title">Date & Time</h3>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
                <span className="label-emoji">📅</span>
                Event Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
                min={getTodayDate()}
              />
              {errors.date && (
                <span className="error-message">
                  <span className="error-emoji">❌</span>
                  {errors.date}
                </span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="time">
                <span className="label-emoji">⏰</span>
                Event Time <span className="required">*</span>
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={errors.time ? 'error' : ''}
              />
              {errors.time && (
                <span className="error-message">
                  <span className="error-emoji">❌</span>
                  {errors.time}
                </span>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cost">
                <span className="label-emoji">💰</span>
                Cost
              </label>
              <div className="cost-input-container">
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className={`cost-input ${errors.cost ? 'error' : ''}`}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <span className="currency-symbol">RON</span>
              </div>
              {errors.cost && (
                <span className="error-message">
                  <span className="error-emoji">❌</span>
                  {errors.cost}
                </span>
              )}
              <small className="help-text">
                <span className="help-emoji">💡</span>
                Leave empty or 0 for free events
              </small>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="form-section">
          <div className="section-header">
            <span className="section-emoji">📍</span>
            <h3 className="section-title">Location</h3>
          </div>
          
          <div className="location-container">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location.exact">
                  <span className="label-emoji">🏢</span>
                  Venue/Address
                </label>
                <input
                  type="text"
                  id="location.exact"
                  name="location.exact"
                  value={formData.location.exact}
                  onChange={handleChange}
                  placeholder="Enter venue name or address"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location.zone">
                  <span className="label-emoji">🗺️</span>
                  Zone <span className="required">*</span>
                </label>
                <select
                  id="location.zone"
                  name="location.zone"
                  value={formData.location.zone}
                  onChange={handleChange}
                  className={errors['location.zone'] ? 'error' : ''}
                >
                  <option value="">Select a zone</option>
                  {availableZones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                {errors['location.zone'] && (
                  <span className="error-message">
                    <span className="error-emoji">❌</span>
                    {errors['location.zone']}
                  </span>
                )}
              </div>
            </div>
            
            <div className="coordinates-row">
              <div className="form-group">
                <label htmlFor="location.latitude">
                  <span className="label-emoji">🧭</span>
                  Latitude
                </label>
                <input
                  type="number"
                  id="location.latitude"
                  name="location.latitude"
                  value={formData.location.latitude}
                  onChange={handleChange}
                  className={errors['location.latitude'] ? 'error' : ''}
                  placeholder="44.4268"
                  step="any"
                />
                {errors['location.latitude'] && (
                  <span className="error-message">
                    <span className="error-emoji">❌</span>
                    {errors['location.latitude']}
                  </span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="location.longitude">
                  <span className="label-emoji">🧭</span>
                  Longitude
                </label>
                <input
                  type="number"
                  id="location.longitude"
                  name="location.longitude"
                  value={formData.location.longitude}
                  onChange={handleChange}
                  className={errors['location.longitude'] ? 'error' : ''}
                  placeholder="26.1025"
                  step="any"
                />
                {errors['location.longitude'] && (
                  <span className="error-message">
                    <span className="error-emoji">❌</span>
                    {errors['location.longitude']}
                  </span>
                )}
              </div>
            </div>
            
            <small className="help-text">
              <span className="help-emoji">💡</span>
              Coordinates are optional but help with map integration
            </small>
          </div>
        </div>

        {/* Categories & Image Section */}
        <div className="form-section">
          <div className="section-header">
            <span className="section-emoji">🎨</span>
            <h3 className="section-title">Categories & Media</h3>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categories">
                <span className="label-emoji">📂</span>
                Event Categories
              </label>
              <select
                id="categories"
                name="categories"
                multiple
                value={formData.categories}
                onChange={handleCategoriesChange}
                className="categories-select"
              >
                {availableCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              <small className="help-text">
                <span className="help-emoji">💡</span>
                Hold CTRL/CMD to select multiple categories
              </small>
            </div>
          </div>
          
          <div className="form-row single">
            <div className="form-group full-width">
              <label htmlFor="image">
                <span className="label-emoji">🖼️</span>
                Event Image
              </label>
              <div className="image-upload-container">
                <div className="image-preview">
                  {previewImage ? (
                    <img src={previewImage} alt="Event preview" />
                  ) : (
                    <div className="image-placeholder">
                      <span className="placeholder-emoji">🖼️</span>
                      <span className="placeholder-text">No image selected</span>
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="image" className="upload-button">
                  <span className="upload-emoji">{previewImage ? '🔄' : '📤'}</span>
                  {previewImage ? 'Change Image' : 'Upload Image'}
                </label>
                
                {errors.image && (
                  <span className="error-message">
                    <span className="error-emoji">❌</span>
                    {errors.image}
                  </span>
                )}
                
                <small className="help-text">
                  <span className="help-emoji">💡</span>
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
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
                <span className="button-emoji">{event ? '💾' : '🎉'}</span>
                {event ? 'Update Event' : 'Create Event'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;