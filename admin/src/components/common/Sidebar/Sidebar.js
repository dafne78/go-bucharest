import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import apiService from '../../../services/apiService';
import './Sidebar.css';

const Sidebar = () => {
  // User data state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bio: "",
    interests: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    window.location.href = 'http://localhost:3000/';
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user data
      const userResponse = await apiService.get('/auth/me');
      if (userResponse.success && userResponse.data) {
        setUserData({
          ...userResponse.data,
          interests: userResponse.data.interests || []
        });
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
        <p className="sidebar-subtitle">Go Bucharest</p>
      </div>
      <div className="sidebar-user">
        <p className="user-greeting">
          {isLoading ? (
            <span className="loading-text">Loading...</span>
          ) : (
            `Hello, ${userData.name || 'Admin'}`
          )}
        </p>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('/admin') ? 'active' : ''}>
            <Link to="/admin">
              <i className="icon dashboard-icon"></i>
              Dashboard
            </Link>
          </li>
          <li className={isActive('/users') ? 'active' : ''}>
            <Link to="/users">
              <i className="icon users-icon"></i>
              Users
            </Link>
          </li>
          <li className={isActive('/events') ? 'active' : ''}>
            <Link to="/events">
              <i className="icon events-icon"></i>
              Events
            </Link>
          </li>
          <li className={isActive('/categories') ? 'active' : ''}>
            <Link to="/categories">
              <i className="icon categories-icon"></i>
              Categories 
            </Link>
          </li>
          <li className={isActive('/tags') ? 'active' : ''}>
            <Link to="/tags">
              <i className="icon tags-icon"></i>
              Tags
            </Link>
          </li>
        </ul>
        
        {/* Go back to website button */}
        <div className="sidebar-divider"></div>
        <ul>
          <li>
            <a href="http://localhost:3000/" className="back-to-website" onClick={handleLinkClick}>
              <i className="icon website-icon"></i>
              Go Back to Website
            </a>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>© 2025 Event Platform</p>
      </div>
    </div>
  );
};

export default Sidebar;