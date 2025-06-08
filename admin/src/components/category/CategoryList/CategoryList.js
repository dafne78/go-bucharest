// /admin/src/components/category/CategoryList/CategoryList.js
import React, { useState, useEffect } from 'react';
import categoryService from '../../../services/categoryService';
import Table from '../../common/Table/Table';
import './CategoryList.css';

const CategoryList = ({ onEdit, onView }) => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'category_name', direction: 'asc' });

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Could not load categories. Please try again.');
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

  const handleDeleteCategory = async (category) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(category.id);
        setCategories(categories.filter(cat => cat.id !== category.id));
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Could not delete the category. Please try again.');
      }
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getTagNames = (tagIds) => {
    if (!tagIds || !Array.isArray(tagIds) || !tags.length) return '';
    
    return tagIds.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? tag.name : '';
    }).filter(name => name).join(', ');
  };

  const sortedCategories = React.useMemo(() => {
    let sortableCategories = [...categories];
    if (sortConfig.key) {
      sortableCategories.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableCategories;
  }, [categories, sortConfig]);

  const filteredCategories = sortedCategories.filter(category => 
    category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'Image', 
      accessor: 'category_image',
      render: (value) => (
        <div className="category-thumbnail">
          {value ? (
            <img src={value} alt="Category thumbnail" />
          ) : (
            <div className="no-image">
              <span className="no-image-emoji">🖼️</span>
              <span className="no-image-text">No image</span>
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'Name', 
      accessor: 'category_name',
      sortable: true
    },
    { 
      header: 'Tags', 
      accessor: 'tags',
      render: (value) => {
        const tagNames = getTagNames(value);
        return tagNames ? (
          <div className="tags-display">
            <span className="tags-emoji">🏷️</span>
            {tagNames}
          </div>
        ) : (
          <div className="no-tags">
            <span className="no-tags-emoji">🚫</span>
            No tags
          </div>
        );
      }
    }
  ];

  const actions = [
    { 
      type: 'view', 
      emoji: '👁️', 
      label: 'View Details',
      onClick: onView
    },
    { 
      type: 'edit', 
      emoji: '✏️', 
      label: 'Edit',
      onClick: onEdit
    },
    { 
      type: 'delete', 
      emoji: '🗑️', 
      label: 'Delete',
      onClick: handleDeleteCategory
    }
  ];

  return (
    <div className="category-list">
      <div className="list-header">
        <div className="search-filter">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-emoji">🔍</span>
          </div>
        </div>
        <div className="list-actions">
          <button className="refresh-button" onClick={fetchCategories}>
            <span className="refresh-emoji">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="list-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <span className="error-emoji">❌</span>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchCategories}>Try Again</button>
          </div>
        ) : (
          <>
            <div className="list-stats">
              <span className="stats-total">Total: <strong>{categories.length}</strong> categories</span>
              <span className="stats-filtered">Displayed: <strong>{filteredCategories.length}</strong></span>
            </div>

            {filteredCategories.length > 0 ? (
              <Table 
                columns={columns} 
                data={filteredCategories} 
                actions={actions}
                onSort={requestSort}
                sortConfig={sortConfig}
              />
            ) : (
              <div className="no-results">
                <span className="no-results-emoji">😔</span>
                <p>No categories found matching your search criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryList;