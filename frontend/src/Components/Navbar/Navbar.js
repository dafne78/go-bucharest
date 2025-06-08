import React from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./Navbar.css";

const Navbar = ({ isLoggedIn, setisLoggedIn }) => {
  const navigate = useNavigate();

  const handleSignOut = (e) => {
    e.preventDefault();
    // Clear all auth data using authService
    authService.logout();
    // Update login state
    setisLoggedIn(false);
    // Redirect to home page
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="nav-logo">
          <span className="logo-text">Go Bucharest</span>
      </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">About</Link>
          </li>
          <li className="nav-item">
            <Link to="/events" className="nav-link">Events</Link>
        </li>
          <li className="nav-item">
            <Link to="/review" className="nav-link">Review</Link>
        </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-link">Contact</Link>
        </li>
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link to="/profile" className="nav-link">Profile</Link>
        </li>
              <li className="nav-item">
                <Link to="/" onClick={handleSignOut} className="nav-link">
                  Sign Out
          </Link>
        </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-link">
                Log In
          </Link>
        </li>
          )}
      </ul>
      </div>
    </nav>
  );
};

export default Navbar;