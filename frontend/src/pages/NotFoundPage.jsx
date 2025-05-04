import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="sad-face">😕</div>
        
        <h1 className="not-found-title">Page Not Found</h1>
        
        <p className="not-found-message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/" className="home-button">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
