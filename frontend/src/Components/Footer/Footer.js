import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>About Us</h4>
          <ul>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/about#team">Our Team</Link></li>
            <li><Link to="/about#careers">Careers</Link></li>
          </ul>
        </div>
        
        <div className="footer-section footer-contact">
          <h4>Contact</h4>
          <ul>
            <li><FontAwesomeIcon icon={faMapMarkerAlt} /> Bucharest, Romania</li>
            <li><FontAwesomeIcon icon={faPhone} /> +40 773 858 273</li>
            <li><FontAwesomeIcon icon={faEnvelope} /> info@gobucharest.com</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="footer-social">
            <a href="#"><FontAwesomeIcon icon={faFacebookF} /></a>
            <a href="#"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="#"><FontAwesomeIcon icon={faTwitter} /></a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Go Bucharest | <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a></p>
      </div>
    </footer>
  );
};

export default Footer;