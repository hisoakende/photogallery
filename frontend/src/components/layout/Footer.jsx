import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">PhotoGallery</Link>
            <p className="footer-tagline">Capture moments, create memories</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h3>Explore</h3>
              <ul>
                <li><Link to="/photos">Photos</Link></li>
                <li><Link to="/albums">Albums</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3>Account</h3>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/profile">My Profile</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3>Legal</h3>
              <ul>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} PhotoGallery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
