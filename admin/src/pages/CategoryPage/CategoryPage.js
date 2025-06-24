// /admin/src/pages/CategoryPage/CategoryPage.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header/Header';
import CategoryList from '../../components/category/CategoryList/CategoryList';
import CategoryForm from '../../components/category/CategoryForm/CategoryForm';
import CategoryDetail from '../../components/category/CategoryDetails/CategoryDetails';
import categoryService from '../../services/categoryService';
import './Categories.css';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeView, setActiveView] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setActiveView('add');
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setActiveView('edit');
  };

  const handleCloseForm = () => {
    setActiveView('list');
    setSelectedCategory(null);
    setError(null);
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.category_name}"?`)) {
      try {
        await categoryService.deleteCategory(category.id);
        setCategories(categories.filter(cat => cat.id !== category.id));
        showSuccessMessage('Category deleted successfully!');
        handleCloseForm();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError(error.message || 'Failed to delete category');
      }
    }
  };

  // Show success message with auto-hide
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleSaveCategory = async (categoryData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let updatedCategories;
      
      if (selectedCategory) {
        // Update existing category
        const response = await categoryService.updateCategory(selectedCategory.id, categoryData);
        setSuccessMessage('Category updated successfully!');
        
        // Update the category in the state
        updatedCategories = categories.map(category => 
          category.id === selectedCategory.id 
            ? { ...category, ...categoryData } 
            : category
        );
      } else {
        // Add new category
        const response = await categoryService.createCategory(categoryData);
        setSuccessMessage('Category added successfully!');
        
        // Add the new category to the state
        updatedCategories = [...categories, response.data || response];
      }
      
      setCategories(updatedCategories);
      
      // Show success message
      setShowSuccess(true);
      
      // Close success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Return to list
      handleCloseForm();
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.message || 'Could not save the category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="categories-page">
      <Header 
        title="Categories Management" 
        handleAdd={handleAddCategory}
        handleAddText = "Add New Category"
      />
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      ) : (
        <div className="categories-content">
          {activeView === 'list' && (
            <>
              {showSuccess && (
                <div className="success-alert">
                  {successMessage}
                </div>
              )}
                {categories.length === 0 && !loading && (
                <div className="empty-state">
                  <p>No categories found.</p>
                </div>
              )}
                <CategoryList
                  onEdit={handleEditCategory}
                  categories={categories}
                  tags={tags}
                  setCategories={setCategories}
                  fetchCategories={fetchCategories}
                />
            </>
          )}
        
        {(activeView === 'add' || activeView === 'edit') && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{activeView === 'add' ? 'Add Category' : 'Edit Category'}</h2>
                <button className="close-button" onClick={handleCloseForm}>×</button>
              </div>
              
              {error && (
                <div className="error-alert modal-error">
                  <span className="error-icon">❌</span>
                  {error}
                </div>
              )}
              
              <CategoryForm 
                category={selectedCategory} 
                onSubmit={handleSaveCategory} 
                onCancel={handleCloseForm}
                onDelete={selectedCategory ? handleDeleteCategory : null}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default CategoryPage;