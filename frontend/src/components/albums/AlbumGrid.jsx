import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { format } from 'date-fns';
import { getAlbumPreviewImage } from '../../api/albumUtils';
import './AlbumGrid.css';

const AlbumGrid = ({ albums, loading, error }) => {
  if (loading) {
    return <div className="loading-indicator">Loading albums...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="album-grid">
      {albums.map(album => (
        <div key={album.id} className="album-grid-item">
          <Link to={`/albums/${album.id}`} className="album-link">
            <div className="album-cover">
              <img 
                src={getAlbumPreviewImage(album)} 
                alt={album.title} 
                className="album-cover-image"
              />
              {album.is_private && (
                <div className="album-privacy-badge">
                  <FiLock /> Private
                </div>
              )}
            </div>
            <div className="album-info">
              <h3 className="album-title">{album.title}</h3>
              <div className="album-meta">
                <span className="album-photo-count">
                  {album.photos?.length || 0} photos
                </span>
                <span className="album-date">
                  {format(new Date(album.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AlbumGrid;
