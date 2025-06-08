// /admin/src/components/category/CategoryForm/CategoryForm.js
import React, { useState, useEffect } from 'react';
import categoryService from '../../../services/categoryService';
import './CategoryForm.css';

const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    category_name: '',
    category_image: null,
    tags: []
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.category_name || '',
        tags: category.tags || [],
        category_image: null // Don't load existing image, just show preview
      });
      
      setPreviewImage(category.category_image || '');
    }
  }, [category]);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const response = await categoryService.getAllTags();
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoading(false);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      category_image: file
    }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
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
      // Prepare form data for submission
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('category_name', formData.category_name);
      
      // Append tags as JSON string
      formDataToSubmit.append('tags', JSON.stringify(formData.tags));
      
      // Append image if exists
      if (formData.category_image) {
        formDataToSubmit.append('category_image', formData.category_image);
      }
      
      await onSubmit(formDataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling is managed by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="category-form-container">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : (
        <form className="category-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category_name">
                  <span className="label-emoji">📁</span>
                  Category Name <span className="required">*</span>
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
                <label htmlFor="category_image">
                  <span className="label-emoji">🖼️</span>
                  Category Image
                </label>
                <div className="image-upload-container">
                  {previewImage && (
                    <div className="image-preview">
                      <img src={previewImage} alt="Category preview" />
                    </div>
                  )}
                  <input
                    type="file"
                    id="category_image"
                    name="category_image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="category_image" className="upload-button">
                    <span className="upload-emoji">{previewImage ? '🔄' : '📤'}</span>
                    {previewImage ? 'Change Image' : 'Upload Image'}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tags">
                  <span className="label-emoji">🏷️</span>
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
                  <span className="help-emoji">💡</span>
                  Hold CTRL to select multiple tags
                </small>
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
                  <span className="button-emoji">{category ? '💾' : '📁'}</span>
                  {category ? 'Update Category' : 'Add Category'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CategoryForm;