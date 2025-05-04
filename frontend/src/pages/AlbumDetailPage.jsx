import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiEdit2, FiTrash, FiPlus, FiLock, FiArrowLeft, FiImage, FiX } from 'react-icons/fi';
import { getAlbum, deleteAlbum } from '../api/albums';
import { removePhotoFromAlbum } from '../api/photos';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/ui/Modal';
import './AlbumDetailPage.css';

const AlbumDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Новые состояния для удаления фотографии из альбома
  const [photoToRemove, setPhotoToRemove] = useState(null);
  const [showRemovePhotoModal, setShowRemovePhotoModal] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const albumData = await getAlbum(id);
        const updatedAlbum = {
            ...albumData,
            photos: albumData.photos.map(photo => ({
              ...photo,
              file_path: "http://localhost:8000/" + photo.file_path
            }))
          };
        setAlbum(updatedAlbum);
      } catch (err) {
        console.error('Error fetching album:', err);
        setError('Failed to load album. It may have been deleted or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  const isOwner = user && album?.owner && user.id === album.owner.id;
  const hasPhotos = album?.photos && album.photos.length > 0;

  // Обработчик удаления альбома
  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await deleteAlbum(album.id);
      setShowDeleteModal(false);
      navigate('/albums');
    } catch (err) {
      console.error('Error deleting album:', err);
      alert('Failed to delete album. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Обработчик для открытия модального окна подтверждения удаления фотографии из альбома
  const handleRemovePhotoClick = (photo) => {
    setPhotoToRemove(photo);
    setShowRemovePhotoModal(true);
  };

  // Обработчик удаления фотографии из альбома
  const handleRemovePhoto = async () => {
    if (!photoToRemove || isRemovingPhoto) return;
    
    try {
      setIsRemovingPhoto(true);
      
      // Вызываем API для удаления фотографии из альбома
      await removePhotoFromAlbum(photoToRemove.id, album.id);
      
      // Обновляем локальное состояние альбома, удаляя фотографию
      setAlbum({
        ...album,
        photos: album.photos.filter(photo => photo.id !== photoToRemove.id)
      });
      
      setShowRemovePhotoModal(false);
      setPhotoToRemove(null);
      
    } catch (err) {
      console.error('Error removing photo from album:', err);
      alert('Failed to remove photo from album. Please try again.');
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="album-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading album...</p>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="album-detail-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Album not found'}</p>
          <button 
            className="button button-primary" 
            onClick={() => navigate('/albums')}
          >
            <FiArrowLeft /> Return to Albums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="album-detail-page">
      <div className="album-header">
        <div className="album-title-section">
          <h1 className="album-title">
            {album.title}
            {album.is_private && (
              <span className="private-indicator">
                <FiLock /> Private
              </span>
            )}
          </h1>
          
          {isOwner && (
            <div className="album-actions">
              <Link to={`/albums/${album.id}/edit`} className="button button-edit">
                <FiEdit2 /> Редактировать
              </Link>
              <button 
                className="button button-delete" 
                onClick={() => setShowDeleteModal(true)}
              >
                <FiTrash /> Удалить
              </button>
            </div>
          )}
        </div>

        <div className="album-meta">
          <div className="album-owner">
            By <Link to={`/users/${album.owner.id}`}>{album.owner.username}</Link>
          </div>
          <div className="album-date">
            Создан {format(new Date(album.created_at), 'MMMM d, yyyy')}
          </div>
        </div>

        {album.description && (
          <div className="album-description">
            <p>{album.description}</p>
          </div>
        )}
      </div>

      <div className="album-content">
        <div className="photos-header">
          <h2 className="photos-title">Photos</h2>
          {isOwner && (
            <Link to={`/albums/${album.id}/add-photos`} className="button button-add">
              <FiPlus /> Добавить фотографии
            </Link>
          )}
        </div>

        {hasPhotos ? (
          <div className="album-photos-grid">
            {album.photos.map(photo => (
              <div key={photo.id} className="photo-item">
                <Link to={`/photos/${photo.id}`} className="photo-link">
                  <div className="photo-image-container">
                    <img 
                      src={photo.file_path} 
                      alt={photo.title} 
                      className="photo-image" 
                    />
                  </div>
                  <div className="photo-info">
                    <h3 className="photo-title">{photo.title}</h3>
                    {photo.description && (
                      <p className="photo-description">{photo.description}</p>
                    )}
                  </div>
                </Link>
                
                {/* Кнопка удаления фотографии из альбома (только для владельца) */}
                {isOwner && (
                  <button 
                    className="remove-photo-button"
                    onClick={() => handleRemovePhotoClick(photo)}
                    title="Remove from album"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-album">
            <div className="empty-album-content">
              <FiImage className="empty-album-icon" />
              <p>This album doesn't have any photos yet.</p>
              {isOwner && (
                <Link to={`/albums/${album.id}/add-photos`} className="button button-primary">
                  Add Photos
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно удаления альбома */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Delete Album"
      >
        <div className="delete-modal-content">
          <p>Are you sure you want to delete this album? All photos will remain in your library, but this album will be permanently removed.</p>
          <div className="modal-actions">
            <button 
              className="button button-secondary" 
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button 
              className="button button-delete" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Новое модальное окно для подтверждения удаления фотографии из альбома */}
      <Modal 
        isOpen={showRemovePhotoModal} 
        onClose={() => {
          if (!isRemovingPhoto) {
            setShowRemovePhotoModal(false);
            setPhotoToRemove(null);
          }
        }}
        title="Remove Photo from Album"
      >
        <div className="remove-photo-modal-content">
          <p>Are you sure you want to remove "{photoToRemove?.title}" from this album?</p>
          <p className="note">The photo will remain in your library and can be added to albums again later.</p>
          
          <div className="modal-actions">
            <button 
              className="button button-secondary" 
              onClick={() => {
                setShowRemovePhotoModal(false);
                setPhotoToRemove(null);
              }}
              disabled={isRemovingPhoto}
            >
              Cancel
            </button>
            <button 
              className="button button-delete" 
              onClick={handleRemovePhoto}
              disabled={isRemovingPhoto}
            >
              {isRemovingPhoto ? 'Removing...' : 'Remove from Album'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlbumDetailPage;
