// /admin/src/components/category/CategoryForm/CategoryForm.js
import React, { useState, useEffect } from 'react';
import categoryService from '../../../services/categoryService';
import './CategoryForm.css';

const CategoryForm = ({ category, onSubmit, onCancel, onDelete, isLoading }) => {
  const [formData, setFormData] = useState({
    category_name: '',
    tags: []
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.category_name || '',
        tags: category.tags || []
      });
    }
  }, [category]);

  const fetchTags = async () => {
    setIsLoadingData(true);
    try {
      const response = await categoryService.getAllTags();
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

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

  const handleTagsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      tags: selectedOptions
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.category_name.trim()) {
      newErrors.category_name = 'Category name is required';
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
      // Prepare form data as JSON object
      const formDataToSubmit = {
        category_name: formData.category_name,
        tags: formData.tags
      };
      
      await onSubmit(formDataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save category. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(category);
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to delete category. Please try again.'
      }));
    }
  };

  if (isLoadingData) {
    return (
      <div className="category-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-form-container">
        <form className="category-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category_name">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="category_name"
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  className={errors.category_name ? 'error' : ''}
                  placeholder="Enter category name"
                />
                {errors.category_name && <span className="error-message">{errors.category_name}</span>}
              </div>
            </div>            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tags">
                  Associated Tags
                </label>
                <select
                  id="tags"
                  name="tags"
                  multiple
                  value={formData.tags}
                  onChange={handleTagsChange}
                  className="tags-select"
                >
                  {availableTags.map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <small className="help-text">
                  Hold CTRL to select multiple tags
                </small>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            {category && onDelete && (
              <button 
                type="button" 
                className="delete-button" 
                onClick={handleDelete}
                disabled={isLoading || isSubmitting}
              >
                Delete Category
              </button>
            )}
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </button>
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
                category ? 'Update Category' : 'Add Category'
              )}
            </button>
          </div>
        </form>
    </div>
  );
};

export default CategoryForm;