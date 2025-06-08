// /admin/src/pages/CategoryPage/CategoryPage.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header/Header';
import CategoryList from '../../components/category/CategoryList/CategoryList';
import CategoryForm from '../../components/category/CategoryForm/CategoryForm';
import CategoryDetail from '../../components/category/CategoryDetails/CategoryDetails';
import categoryService from '../../services/categoryService';
import authService from '../../services/authService';
import './Categories.css';

const CategoryPage = () => {
  const [user, setUser] = useState(authService.getUser());
  const [activeView, setActiveView] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    // Update user state
    const currentUser = authService.getUser();
    setUser(currentUser);
    console.log('Current user in EventsPage:', currentUser);
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setActiveView('add');
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setActiveView('edit');
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setActiveView('view');
  };

  const handleCloseForm = () => {
    setActiveView('list');
    setSelectedCategory(null);
    setError(null);
  };

  const handleSaveCategory = async (categoryData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (selectedCategory) {
        // Update existing category
        await categoryService.updateCategory(selectedCategory.id, categoryData);
        setSuccessMessage('Category updated successfully!');
      } else {
        // Add new category
        await categoryService.createCategory(categoryData);
        setSuccessMessage('Category added successfully!');
      }
      
      // Show success message
      setShowSuccess(true);
      
      // Close success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Return to list
      setActiveView('list');
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.message || 'Could not save the category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
    // Handle logout
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="categories-page">
      <Header 
              title="Categories Management" 
              user={user}
              onLogout={handleLogout} // Optional: add logout functionality to Header
            />
      
      {showSuccess && (
        <div className="success-alert">
          <span className="success-icon">✅</span>
          {successMessage}
          <button className="close-alert" onClick={() => setShowSuccess(false)}>×</button>
        </div>
      )}
      
      <div className="page-actions">
        {activeView === 'list' && (
          <button className="add-button" onClick={handleAddCategory}>
            <span className="add-emoji">📁</span>
            Add Category
          </button>
        )}
      </div>
      
      <div className="categories-content">
        {activeView === 'list' && (
          <CategoryList 
            onEdit={handleEditCategory} 
            onView={handleViewCategory} 
          />
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
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
        
        {activeView === 'view' && (
          <div className="modal-overlay">
            <CategoryDetail 
              categoryId={selectedCategory.id} 
              onClose={handleCloseForm}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;