import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './PhotoCard.css';

const PhotoCard = ({ photo }) => {
  let { id, title, file_path, created_at, owner } = photo;
  file_path = `http://localhost:8000/` + file_path
  // Обработка ошибок для значений по умолчанию
  const safeTitle = title || 'Untitled';
  const safeUsername = owner?.username || 'Unknown user';
  const safeDate = created_at ? format(new Date(created_at), 'MMM d, yyyy') : 'Unknown date';

  return (
    <div className="photo-card">
      <Link to={`/photos/${id}`} className="photo-link">
        <div className="photo-image-wrapper">
          <img 
            src={file_path}
            alt={safeTitle} 
            className="photo-image" 
            onError={(e) => {
              console.error("Failed to load image:", file_path);
              e.target.src = '/placeholder.jpg'; // Замените на путь к заглушке
            }}
          />
        </div>
        <div className="photo-info">
          <h3 className="photo-title">{safeTitle}</h3>
          <div className="photo-meta">
            <span className="photo-author">By {safeUsername}</span>
            <span className="photo-date">{safeDate}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PhotoCard;
