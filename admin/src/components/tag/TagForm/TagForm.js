// /admin/src/components/tag/TagForm/TagForm.js
import React, { useState, useEffect } from 'react';
import './TagForm.css';

const TagForm = ({ tag, onSubmit, onCancel, onDelete, isLoading }) => {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name || ''
      });
    }
  }, [tag]);

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
      newErrors.name = 'Tag name is required';
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
      const tagData = { ...formData };
      
      await onSubmit(tagData);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling is managed by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  

  const handleDelete = async () => {
    try {
      await onDelete(tag);
    } catch (error) {
      console.error('Error deleting tag:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to delete tag. Please try again.'
      }));
    }
  };

  return (
    <div className="tag-form-container">
      <form className="tag-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                Tag Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter tag name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>
        </div>
        <div className="form-actions">
          {tag && onDelete && (
            <button 
              type="button" 
              className="delete-button" 
              onClick={handleDelete}
              disabled={isLoading || isSubmitting}
            >
              Delete Tag
            </button>
          )}
          <button 
            type="button" 
            className="cancel-button" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
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
                {tag ? 'Update Tag' : 'Add Tag'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TagForm;