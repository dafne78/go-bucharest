// /src/components/event/EventForm/EventForm.js
import React, { useState, useEffect } from 'react';
import eventService from '../../../services/eventsService';
import categoryService from '../../../services/categoryService';
import locationService from '../../../services/locationService';
import imageService from '../../../services/imageService';
import tagService from '../../../services/tagService';
import './EventForm.css';

const EventForm = ({ event, onSubmit, onCancel, onDelete, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    cost: '',
    image: null,
    categories: [],
    tags: [],
    location: {
      exact: '',
      zone: '',
      latitude: '',
      longitude: ''
    }
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableZones, setAvailableZones] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    fetchData();
    console.log(event);
  }, []);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        date: event.date ? event.date.split('T')[0] : '',
        time: event.time || '',
        cost: event.cost || '',
        categories: event.categories || [],
        tags: event.tags || [],
        location: {
          exact: event.location?.exact || '',
          zone: event.location?.zone || '',
          latitude: event.location?.latitude || '',
          longitude: event.location?.longitude || ''
        },
        image: null
      });
      
      setPreviewImage(event.image || '');
    } else {
      // Reset form when adding new event
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        cost: '',
        image: null,
        categories: [],
        tags: [],
        location: {
          exact: '',
          zone: '',
          latitude: '',
          longitude: ''
        }
      });
      setPreviewImage('');
    }
  }, [event]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [categoriesResponse, zonesResponse, tagsResponse] = await Promise.all([
        categoryService.getAllCategories(),
        locationService.getAllLocations(),
        tagService.getAllTags()
      ]);
      
      setAvailableCategories(categoriesResponse.data || []);
      setAvailableZones(zonesResponse.data || []);
      setAvailableTags(tagsResponse.data || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
      setErrors(prev => ({
        ...prev,
        fetch: 'Failed to load form data. Please refresh the page.'
      }));
    } finally {
      setIsLoadingData(false);
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
    
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        image: 'Please select a valid image file'
      }));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: 'Image size must be less than 5MB'
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      image: file
    }));
    
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: null
      }));
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (!formData.location.zone) {
      newErrors['location.zone'] = 'Zone is required';
    }
    
    if (formData.cost && (isNaN(formData.cost) || formData.cost < 0)) {
      newErrors.cost = 'Cost must be a valid positive number';
    }
    
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
      const eventData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        categories: formData.categories,
        tags: formData.tags,
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
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save event. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(event);
    } catch (error) {
      console.error('Error deleting event:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to delete event. Please try again.'
      }));
    }
  };

  if (isLoadingData) {
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
                placeholder="Enter event title"
                disabled={isLoading || isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? 'error' : ''}
                placeholder="Enter event description"
                rows="4"
                disabled={isLoading || isSubmitting}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
                disabled={isLoading || isSubmitting}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="time">
                Time <span className="required">*</span>
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={errors.time ? 'error' : ''}
                disabled={isLoading || isSubmitting}
              />
              {errors.time && <span className="error-message">{errors.time}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cost">Cost</label>
              <div className="cost-input-container">
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className={`cost-input ${errors.cost ? 'error' : ''}`}
                  placeholder="0 RON"
                  min="0"
                  step="0.01"
                  disabled={isLoading || isSubmitting}
                />
              </div>
              {errors.cost && <span className="error-message">{errors.cost}</span>}
              <small className="help-text">Leave empty or 0 for free events</small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location.exact">Address <span className="required">*</span></label>
              <input
                type="text"
                id="location.exact"
                name="location.exact"
                value={formData.location.exact}
                onChange={handleChange}
                placeholder="Enter venue name or address"
                disabled={isLoading || isSubmitting}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location.zone">
                Zone <span className="required">*</span>
              </label>
              <select
                id="location.zone"
                name="location.zone"
                value={formData.location.zone}
                onChange={handleChange}
                className={errors['location.zone'] ? 'error' : ''}
                disabled={isLoading || isSubmitting}
              >
                <option value="">Select a zone</option>
                {availableZones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
              {errors['location.zone'] && <span className="error-message">{errors['location.zone']}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categories">Categories</label>
              <select
                id="categories"
                name="categories"
                multiple
                value={formData.categories}
                onChange={handleCategoriesChange}
                className="categories-select"
                disabled={isLoading || isSubmitting}
              >
                {availableCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              <small className="help-text">Hold CTRL/CMD to select multiple categories</small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Event Image</h3>
          <div className="form-row">
            <div className="form-group">
              <div className="image-upload-container">
                <div className="image-preview">
                  {previewImage ? (
                    <img src={previewImage} alt="Event preview" />
                  ) : (
                    <div className="image-placeholder">
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
                  disabled={isLoading || isSubmitting}
                />
                <label htmlFor="image" className="upload-button">
                  {previewImage ? 'Change Image' : 'Upload Image'}
                </label>
                
                {errors.image && <span className="error-message">{errors.image}</span>}
                
                <small className="help-text">Supported formats: JPG, PNG, GIF. Max size: 5MB</small>
              </div>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="form-error">
            {errors.submit}
          </div>
        )}
        
        <div className="form-actions">
        {event && onDelete && (
            <button 
              type="button" 
              className="delete-button" 
              onClick={handleDelete}
              disabled={isLoading || isSubmitting}
            >
              Delete Event
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
                event ? 'Update Event' : 'Create Event'
              )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;