import React from 'react';
import './Header.css';

const Header = ({ title, user }) => {
  return (
    <header className="header">
      <h1>{title}</h1>
      <div className="header-actions">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input" 
          />
          <button className="search-button">
            <i className="search-icon"></i>
          </button>
        </div>
        <div className="admin-profile">
          <span className="admin-name">Hello, {user.name} </span>
          <div className="admin-avatar">
            <span>👑</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;