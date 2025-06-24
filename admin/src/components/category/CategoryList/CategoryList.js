// /admin/src/components/category/CategoryList/CategoryList.js
import React, { useState, useEffect } from 'react';
import categoryService from '../../../services/categoryService';
import Table from '../../common/Table/Table';
import './CategoryList.css';

const CategoryList = ({ onEdit, onView, onDelete, categories, tags, setCategories, fetchCategories }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'category_name', direction: 'asc' });

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
      type: 'edit', 
      label: 'Edit',
      onClick: onEdit
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
          </div>
        </div>
        <div className="list-actions">
          <button className="refresh-button" onClick={fetchCategories}>
          <i className="refresh-icon"></i>
            Refresh
          </button>
        </div>
      </div>
      <div className="list-content">
        { loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button className="retry-button" onClick={fetchCategories}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="list-stats">
              <span className="stats-total">Total: <strong>{filteredCategories.length}</strong> categories</span>
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