import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FiEdit2, FiTrash, FiPlus, FiLock } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../ui/Modal';
import PhotoGrid from '../photos/PhotoGrid';
import { deleteAlbum } from '../../api/albums';
import './AlbumDetail.css';

const AlbumDetail = ({ album, onAlbumDeleted }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user && album.owner && user.id === album.owner.id;
  const hasPhotos = album.photos && album.photos.length > 0;

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteAlbum(album.id);
      setShowDeleteModal(false);
      if (onAlbumDeleted) {
        onAlbumDeleted();
      } else {
        navigate('/albums');
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      alert('Failed to delete album. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="album-detail">
      <div className="album-detail-header">
        <div className="album-title-container">
          <h1 className="album-title">{album.title}</h1>
          {album.is_private && (
            <span className="album-private-badge">
              <FiLock /> Private
            </span>
          )}
        </div>
        <div className="album-actions">
          {isOwner && (
            <>
              <Link to={`/albums/${album.id}/edit`} className="btn btn-edit">
                <FiEdit2 /> Редактировать
              </Link>
              <button 
                className="btn btn-delete" 
                onClick={() => setShowDeleteModal(true)}
              >
                <FiTrash /> Удалить
              </button>
            </>
          )}
        </div>
      </div>

      <div className="album-metadata">
        <div className="album-author">
          By <Link to={`/users/${album.owner.id}`}>{album.owner.username}</Link>
        </div>
        <div className="album-date">
          Created on {format(new Date(album.created_at), 'MMMM d, yyyy')}
        </div>
      </div>

      {album.description && (
        <div className="album-description">
          <p>{album.description}</p>
        </div>
      )}

      <div className="album-photos-container">
        <div className="album-photos-header">
          <h2>Фотографии</h2>
          {isOwner && (
            <Link to={`/albums/${album.id}/add-photos`} className="btn btn-add">
              <FiPlus /> Добавить фотографии
            </Link>
          )}
        </div>

        {hasPhotos ? (
          <PhotoGrid photos={album.photos} />
        ) : (
          <div className="empty-photos">
            <p>This album doesn't have any photos yet.</p>
            {isOwner && (
              <Link to={`/albums/${album.id}/add-photos`} className="btn-primary">
                Добавить фотографии
              </Link>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Album"
      >
        <p>Are you sure you want to delete this album? All photos will remain in your library, but this album will be permanently removed.</p>
        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="btn btn-delete" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AlbumDetail;
