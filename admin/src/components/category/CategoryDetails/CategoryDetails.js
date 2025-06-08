// /admin/src/components/category/CategoryDetails/CategoryDetails.js
import React, { useState, useEffect } from 'react';
import categoryService from '../../../services/categoryService';
import './CategoryDetail.css';

const CategoryDetails = ({ categoryId, onClose }) => {
  const [category, setCategory] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoryDetails();
    fetchTags();
  }, [categoryId]);

  const fetchCategoryDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategoryById(categoryId);
      setCategory(data.data);
    } catch (error) {
      console.error('Error fetching category details:', error);
      setError('Could not load category details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await categoryService.getAllTags();
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const getTagNames = (tagIds) => {
    if (!tagIds || !Array.isArray(tagIds) || !tags.length) return [];
    
    return tagIds.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? tag.name : '';
    }).filter(name => name);
  };

  if (loading) {
    return (
      <div className="category-detail">
        <div className="detail-header">
          <h2>
            <span className="header-emoji">📁</span>
            Category Details
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading category data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-detail">
        <div className="detail-header">
          <h2>
            <span className="header-emoji">📁</span>
            Category Details
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="error-container">
          <span className="error-emoji">❌</span>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchCategoryDetails}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-detail">
        <div className="detail-header">
          <h2>
            <span className="header-emoji">📁</span>
            Category Details
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="error-message">
          <span className="error-emoji">❌</span>
          <p>Could not load category data.</p>
        </div>
      </div>
    );
  }

  const tagNames = getTagNames(category.tags);

  return (
    <div className="category-detail">
      <div className="detail-header">
        <h2>
          <span className="header-emoji">📁</span>
          Category Details
        </h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="category-detail-content">
        <div className="category-header">
          {category.category_image ? (
            <div className="category-image">
              <img src={category.category_image} alt={category.category_name} />
            </div>
          ) : (
            <div className="category-image no-image-placeholder">
              <span className="no-image-emoji">🖼️</span>
              <span className="no-image-text">No Image</span>
            </div>
          )}
          <h3 className="category-name">
            <span className="category-emoji">📁</span>
            {category.category_name}
          </h3>
        </div>

        <div className="detail-section">
          <h4 className="section-title">
            <span className="section-emoji">🏷️</span>
            Associated Tags
          </h4>
          {tagNames.length > 0 ? (
            <div className="tags-list">
              {tagNames.map((tagName, index) => (
                <span key={index} className="tag-badge">
                  <span className="tag-emoji">🏷️</span>
                  {tagName}
                </span>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <span className="no-data-emoji">🚫</span>
              <p>This category has no associated tags.</p>
            </div>
          )}
        </div>
      </div>

      <div className="detail-footer">
        <button className="secondary-button" onClick={onClose}>
          <span className="button-emoji">✖️</span>
          Close
        </button>
      </div>
    </div>
  );
};

export default CategoryDetails;