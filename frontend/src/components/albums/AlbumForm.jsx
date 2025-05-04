import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiGlobe } from 'react-icons/fi';
import './AlbumForm.css';

const AlbumForm = ({ album, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState(album?.title || '');
  const [description, setDescription] = useState(album?.description || '');
  const [isPrivate, setIsPrivate] = useState(album?.is_private || false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    onSubmit({
      title,
      description,
      is_private: isPrivate
    });
  };

  return (
    <form className="album-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter album title"
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this album"
          rows="4"
        />
      </div>
      
      <div className="form-group">
        <label>Privacy</label>
        <div className="privacy-options">
          <button
            type="button"
            className={`privacy-option ${!isPrivate ? 'active' : ''}`}
            onClick={() => setIsPrivate(false)}
          >
            <FiGlobe />
            <div>
              <strong>Public</strong>
              <span>Anyone can view this album</span>
            </div>
          </button>
          
          <button
            type="button"
            className={`privacy-option ${isPrivate ? 'active' : ''}`}
            onClick={() => setIsPrivate(true)}
          >
            <FiLock />
            <div>
              <strong>Private</strong>
              <span>Only you can view this album</span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : album ? 'Update Album' : 'Create Album'}
        </button>
      </div>
    </form>
  );
};

export default AlbumForm;
