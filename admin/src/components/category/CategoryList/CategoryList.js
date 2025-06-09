// /admin/src/components/category/CategoryList/CategoryList.js
import React, { useState, useEffect } from 'react';
import categoryService from '../../../services/categoryService';
import Table from '../../common/Table/Table';
import './CategoryList.css';

const CategoryList = ({ onEdit, onView, categories, tags, setCategories, fetchCategories }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'category_name', direction: 'asc' });

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
            {tagNames}
          </div>
        ) : (
          <div className="no-tags">
            No tags
          </div>
        );
      }
    }
  ];

  const actions = [
    { 
      type: 'view', 
      label: 'View',
      onClick: onView
    },
    { 
      type: 'edit', 
      label: 'Edit',
      onClick: onEdit
    },
    { 
      type: 'delete', 
      label: 'Delete',
      onClick: handleDeleteCategory
    }
  ];

  return (
    <div className="category-list">
      <div className="list-header">
        <div className="list-actions">
            <button className="refresh-button" onClick={fetchCategories}>
              Refresh
            </button>
          </div>
        <div className="search-filter">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button className="retry-button" onClick={fetchCategories}>
            Try Again
          </button>
        </div>
      ) : (
          <>
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
  );
};

export default CategoryList;