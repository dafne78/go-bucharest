import React from 'react';
import './Header.css';

const Header = ({ title, handleAddText, handleAdd }) => {
  return (
    <header className="page-header">
      <h1>{title}</h1>
          <div className="action-buttons">
            <button className="header-add-button" onClick={handleAdd}>
              {handleAddText}
            </button>
          </div>
    </header>
  );
};

export default Header;