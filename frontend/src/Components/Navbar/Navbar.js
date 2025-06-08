import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isLoggedIn }) => {
  const location = useLocation();

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        Go Bucharest
      </Link>

      <ul className="navbar-menu">
        <li className={isActive("/") ? "active" : ""}>
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>

        <li className={isActive("/about") ? "active" : ""}>
          <Link to="/about" className="nav-link">
            About us
          </Link>
        </li>

        <li className={isActive("/events") ? "active" : ""}>
          <Link to="/events" className="nav-link">
            Events
          </Link>
        </li>

        <li className={isActive("/review") ? "active" : ""}>
          <Link to="/review" className="nav-link">
            Review
          </Link>
        </li>

        <li className={isActive("/contact") ? "active" : ""}>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
        </li>

        <li className={isActive("/profile") ? "active" : ""}>
          <Link to="/profile" className="nav-link">
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;