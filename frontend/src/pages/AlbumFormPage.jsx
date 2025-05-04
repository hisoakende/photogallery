import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { createAlbum, getAlbum, updateAlbum } from '../api/albums';
import { useAuth } from '../contexts/AuthContext';
import './AlbumFormPage.css';

const AlbumFormPage = () => {
  const { id } = useParams(); // id будет определен только для редактирования
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Проверка авторизации
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: isEditMode ? `/albums/${id}/edit` : '/albums/new' } });
    }
  }, [user, navigate, id, isEditMode]);

  // Загрузка данных альбома для редактирования
  useEffect(() => {
    const fetchAlbum = async () => {
      if (isEditMode) {
        try {
          setFetchLoading(true);
          const albumData = await getAlbum(id);
          
          // Проверка прав доступа (только владелец может редактировать)
          if (user && albumData.user_id !== user.id) {
            setError('You do not have permission to edit this album');
            navigate(`/albums/${id}`);
            return;
          }
          
          setTitle(albumData.title);
          setDescription(albumData.description || '');
          setIsPrivate(albumData.is_private || false);
        } catch (err) {
          console.error('Error fetching album:', err);
          setError('Failed to load album details');
        } finally {
          setFetchLoading(false);
        }
      }
    };

    if (user) {
      fetchAlbum();
    }
  }, [id, isEditMode, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const albumData = {
        title,
        description: description || null,
        is_private: isPrivate
      };
      
      let response;
      if (isEditMode) {
        response = await updateAlbum(id, albumData);
        setSuccess('Album updated successfully');
      } else {
        response = await createAlbum(albumData);
        setSuccess('Album created successfully');
      }
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate(`/albums/${response.id || id}`);
      }, 1000);
      
    } catch (err) {
      console.error('Error saving album:', err);
      setError('Failed to save album. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="album-form-page">
        <div className="loading-indicator">Loading album details...</div>
      </div>
    );
  }

  return (
    <div className="album-form-page">
      <div className="album-form-container">
        <h1 className="form-title">{isEditMode ? 'Edit Album' : 'Create New Album'}</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="album-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Enter album title"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              placeholder="Enter album description"
              rows="4"
              disabled={loading}
            ></textarea>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-label">Make this album private</span>
            </label>
            <p className="help-text">
              Private albums are only visible to you
            </p>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/albums/${id}` : '/albums')}
              className="button button-secondary"
              disabled={loading}
            >
              <FiX /> Cancel
            </button>
            
            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              <FiSave /> {loading ? 'Saving...' : 'Save Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlbumFormPage;
