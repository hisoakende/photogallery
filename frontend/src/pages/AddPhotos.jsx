import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiCheck, FiX } from 'react-icons/fi';
import { getAlbum, addPhotoToAlbum, getAvailablePhotosForAlbum } from '../api/albums';
import { uploadPhoto } from '../api/photos';
import { useAuth } from '../contexts/AuthContext';
import './AddPhotos.css';

const AddPhotosToAlbumPage = () => {
  const { id: albumId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [album, setAlbum] = useState(null);
  const [availablePhotos, setAvailablePhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных альбома и доступных фотографий
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем данные альбома
        const albumData = await getAlbum(albumId);
        setAlbum(albumData);
        
        // Проверяем, имеет ли пользователь право добавлять фотографии
        if (user?.id !== albumData.owner.id) {
          setError('You do not have permission to add photos to this album');
          return;
        }
        
        // Получаем доступные фотографии
        const photos = await getAvailablePhotosForAlbum(albumId);
        setAvailablePhotos(photos);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load album or photos');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      // Если пользователь не аутентифицирован, редиректим на страницу входа
      navigate('/login', { state: { from: `/albums/${albumId}/add-photos` } });
    }
  }, [albumId, user, navigate]);

  // Обработчик выбора фотографии
  const togglePhotoSelection = (photoId) => {
    if (selectedPhotos.includes(photoId)) {
      setSelectedPhotos(selectedPhotos.filter(id => id !== photoId));
    } else {
      setSelectedPhotos([...selectedPhotos, photoId]);
    }
  };

  // Обработчик добавления фотографий в альбом
  const handleAddPhotosToAlbum = async () => {
    if (selectedPhotos.length === 0) return;
    
    try {
      setIsAddingPhotos(true);
      setMessage({ type: '', text: '' });
      
      // Добавляем каждую выбранную фотографию в альбом
      for (const photoId of selectedPhotos) {
        await addPhotoToAlbum(albumId, photoId);
      }
      
      setMessage({ 
        type: 'success', 
        text: `Successfully added ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''} to the album` 
      });
      
      // Очищаем выбранные фотографии и обновляем список доступных
      setSelectedPhotos([]);
      const updatedPhotos = await getAvailablePhotosForAlbum(albumId);
      setAvailablePhotos(updatedPhotos);
      
    } catch (err) {
      console.error('Error adding photos to album:', err);
      setMessage({ type: 'error', text: 'Failed to add photos to album' });
    } finally {
      setIsAddingPhotos(false);
    }
  };

  // Обработчик выбора файла для загрузки
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Проверяем, что это изображение
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }
    
    setUploadFile(file);
    setMessage({ type: '', text: '' });
    
    // Создаем превью
    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Очистка выбранного файла
  const clearUploadFile = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadTitle('');
    setUploadDescription('');
  };

  // Обработчик загрузки новой фотографии и добавления в альбом
  const handleUploadAndAdd = async (e) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadTitle.trim()) {
      setMessage({ type: 'error', text: 'Please select an image and enter a title' });
      return;
    }
    
    try {
      setUploading(true);
      setMessage({ type: '', text: '' });
      
      // Загружаем фотографию
      const uploadedPhoto = await uploadPhoto(uploadFile, uploadTitle, uploadDescription);
      
      // Добавляем фотографию в альбом
      await addPhotoToAlbum(albumId, uploadedPhoto.id);
      
      setMessage({ type: 'success', text: 'Photo uploaded and added to album successfully' });
      
      // Очищаем форму загрузки
      clearUploadFile();
      setUploadMode(false);
      
      // Обновляем список доступных фотографий (хотя новая фотография уже в альбоме)
      const updatedAlbum = await getAlbum(albumId);
      setAlbum(updatedAlbum);
      
    } catch (err) {
      console.error('Error uploading and adding photo:', err);
      setMessage({ type: 'error', text: 'Failed to upload and add photo' });
    } finally {
      setUploading(false);
    }
  };

  // Отображение загрузки
  if (loading) {
    return (
      <div className="add-photos-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading album details...</p>
        </div>
      </div>
    );
  }

  // Отображение ошибки
  if (error || !album) {
    return (
      <div className="add-photos-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Album not found'}</p>
          <button 
            className="button button-primary" 
            onClick={() => navigate(`/albums/${albumId}`)}
          >
            <FiArrowLeft /> Return to Album
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-photos-page">
      <div className="page-header">
        <div className="header-top">
          <h1>Add Photos to "{album.title}"</h1>
          <Link to={`/albums/${albumId}`} className="button button-secondary">
            <FiArrowLeft /> Back to Album
          </Link>
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="mode-toggle">
          <button 
            className={`toggle-button ${!uploadMode ? 'active' : ''}`}
            onClick={() => setUploadMode(false)}
          >
            Choose Existing Photos
          </button>
          <button 
            className={`toggle-button ${uploadMode ? 'active' : ''}`}
            onClick={() => setUploadMode(true)}
          >
            Upload New Photo
          </button>
        </div>
      </div>
      
      {uploadMode ? (
        // Режим загрузки новой фотографии
        <div className="upload-section">
          <form onSubmit={handleUploadAndAdd} className="upload-form">
            <div className="upload-preview-container">
              {!uploadPreview ? (
                <div 
                  className="upload-dropzone"
                  onClick={() => document.getElementById('photo-upload').click()}
                >
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden-input"
                  />
                  <FiUpload className="upload-icon" />
                  <p>Кликните, чтобы выбрать фотографию</p>
                  <p className="upload-hint">JPG, PNG, GIF до 10MB</p>
                </div>
              ) : (
                <div className="preview-container">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="preview-image"
                  />
                  <button 
                    type="button" 
                    className="clear-button"
                    onClick={clearUploadFile}
                    title="Remove image"
                  >
                    <FiX />
                  </button>
                </div>
              )}
            </div>
            
            <div className="upload-details">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="form-input"
                  placeholder="Enter photo title"
                  required
                  disabled={uploading || !uploadFile}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="form-textarea"
                  placeholder="Enter photo description"
                  rows="3"
                  disabled={uploading || !uploadFile}
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="button button-primary full-width"
                disabled={uploading || !uploadFile || !uploadTitle.trim()}
              >
                {uploading ? 'Uploading...' : 'Upload and Add to Album'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Режим выбора существующих фотографий
        <div className="select-photos-section">
          {availablePhotos.length === 0 ? (
            <div className="no-photos-message">
              <p>You don't have any photos to add to this album.</p>
              <button 
                className="button button-primary"
                onClick={() => setUploadMode(true)}
              >
                <FiUpload /> Upload New Photo
              </button>
            </div>
          ) : (
            <>
              <div className="selection-header">
                <div className="available-photos-count">
                  {availablePhotos.length} photo{availablePhotos.length !== 1 ? 's' : ''} available
                </div>
                
                <div className="selection-actions">
                  {selectedPhotos.length > 0 && (
                    <div className="selected-count">
                      {selectedPhotos.length} selected
                    </div>
                  )}
                  
                  <button
                    className="button button-primary"
                    onClick={handleAddPhotosToAlbum}
                    disabled={isAddingPhotos || selectedPhotos.length === 0}
                  >
                    {isAddingPhotos ? 'Adding...' : 'Add Selected Photos'}
                  </button>
                </div>
              </div>
              
              <div className="photos-grid">
                {availablePhotos.map(photo => (
                  <div key={photo.id} className="selectable-photo-item">
                    <div 
                      className={`photo-card ${selectedPhotos.includes(photo.id) ? 'selected' : ''}`}
                      onClick={() => togglePhotoSelection(photo.id)}
                    >
                      <div className="photo-image-container">
                        <img 
                          src={photo.file_path} 
                          alt={photo.title} 
                          className="photo-image" 
                        />
                        {selectedPhotos.includes(photo.id) && (
                          <div className="selected-overlay">
                            <FiCheck className="selected-icon" />
                          </div>
                        )}
                      </div>
                      <div className="photo-info">
                        <h3 className="photo-title">{photo.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AddPhotosToAlbumPage;
