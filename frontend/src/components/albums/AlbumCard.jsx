import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiImage } from 'react-icons/fi';
import { format } from 'date-fns';
import { getAlbumPreviewImage } from '../utils/albumUtils';
import './AlbumCard.css';

const AlbumCard = ({ album }) => {
  const previewImage = "http://localhost:8000/" + getAlbumPreviewImage(album);
  console.lob("ABOBA");
  
  const hasPhotos = album.photos && album.photos.length > 0;

  return (
    <div className="album-card">
      <Link to={`/albums/${album.id}`} className="album-card-link">
        <div className="album-card-cover">
          {previewImage ? (
            <img 
              src={previewImage} 
              alt={album.title} 
              className="album-card-image" 
            />
          ) : (
            <div className="album-card-placeholder">
              <FiImage className="placeholder-icon" />
              <span>No Photos</span>
            </div>
          )}
          {album.is_private && (
            <div className="album-card-badge">
              <FiLock /> Private
            </div>
          )}
        </div>
        <div className="album-card-content">
          <h3 className="album-card-title">{album.title}</h3>
          <div className="album-card-meta">
            <span className="album-card-count">
              {hasPhotos ? `${album.photos.length} photos` : 'Empty album'}
            </span>
            <span className="album-card-date">
              {format(new Date(album.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          {album.description && (
            <p className="album-card-description">
              {album.description}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default AlbumCard;
