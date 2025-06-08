import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onLinkClick }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('/admin') ? 'active' : ''}>
            <Link to="/admin" onClick={handleLinkClick}>
              <i className="icon dashboard-icon"></i>
              Dashboard
            </Link>
          </li>
          <li className={isActive('/users') ? 'active' : ''}>
            <Link to="/users" onClick={handleLinkClick}>
              <i className="icon users-icon"></i>
              Users
            </Link>
          </li>
          <li className={isActive('/events') ? 'active' : ''}>
            <Link to="/events" onClick={handleLinkClick}>
              <i className="icon events-icon"></i>
              Events
            </Link>
          </li>
          <li className={isActive('/categories') ? 'active' : ''}>
            <Link to="/categories" onClick={handleLinkClick}>
              <i className="icon categories-icon"></i>
              Categories 
            </Link>
          </li>
          <li className={isActive('/tags') ? 'active' : ''}>
            <Link to="/tags" onClick={handleLinkClick}>
              <i className="icon tags-icon"></i>
              Tags
            </Link>
          </li>
        </ul>
        
        {/* Go back to website button */}
        <div className="sidebar-divider"></div>
        <ul>
          <li>
            <Link to="/" className="back-to-website" onClick={handleLinkClick}>
              <i className="icon website-icon"></i>
              Go Back to Website
            </Link>
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