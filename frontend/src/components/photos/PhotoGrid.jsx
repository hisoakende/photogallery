import React from 'react';
import { Link } from 'react-router-dom';
import PhotoCard from './PhotoCard';
import './PhotoGrid.css';

const PhotoGrid = ({ photos, loading, error }) => {
  if (loading) {
    return <div className="loading-indicator">Loading photos...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="empty-state">
        <h3>No photos found</h3>
        <p>Start by adding some photos to your gallery.</p>
        <Link to="/upload" className="btn-primary">
          Upload a Photo
        </Link>
      </div>
    );
  }

  return (
    <div className="photo-grid">
      {photos.map((photo) => (
        <div key={photo.id} className="photo-grid-item">
          <PhotoCard photo={photo} />
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
