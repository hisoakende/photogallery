import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FiEdit2, FiTrash, FiPlus, FiX, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../ui/Modal';
import CommentList from '../comments/CommentList';
import CommentForm from '../comments/CommentForm';
import { deletePhoto } from '../../api/photos';
import './PhotoDetail.css';

const PhotoDetail = ({ photo, onPhotoDeleted }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user && photo.owner && user.id === photo.owner.id;

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deletePhoto(photo.id);
      setShowDeleteModal(false);
      if (onPhotoDeleted) {
        onPhotoDeleted();
      } else {
        navigate('/photos');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="photo-detail">
      <div className="photo-header">
        <h1 className="photo-title">{photo.title}</h1>
        <div className="photo-actions">
          {isOwner && (
            <>
              <Link to={`/photos/${photo.id}/edit`} className="btn btn-edit">
                <FiEdit2 /> Edit
              </Link>
              <button 
                className="btn btn-delete" 
                onClick={() => setShowDeleteModal(true)}
              >
                <FiTrash /> Delete
              </button>
            </>
          )}
          <a 
            href={`http://localhost:8000/${photo.file_path}`} 
            download 
            className="btn btn-download"
          >
            <FiDownload /> Download
          </a>
        </div>
      </div>

      <div className="photo-metadata">
        <div className="photo-author">
          By <Link to={`/users/${photo.owner.id}`}>{photo.owner.username}</Link>
        </div>
        <div className="photo-date">
          {format(new Date(photo.created_at), 'MMMM d, yyyy')}
        </div>
      </div>

      <div className="photo-image-container">
        <img
          src={`http://localhost:8000/${photo.file_path}`}
          alt={photo.title}
          className="photo-image"
        />
      </div>

      {photo.description && (
        <div className="photo-description">
          <p>{photo.description}</p>
        </div>
      )}

      <div className="photo-albums">
        <h3>Albums</h3>
        {photo.albums && photo.albums.length > 0 ? (
          <div className="album-tags">
            {photo.albums.map((album) => (
              <Link 
                key={album.id} 
                to={`/albums/${album.id}`} 
                className="album-tag"
              >
                {album.title}
                {isOwner && (
                  <button className="remove-from-album">
                    <FiX />
                  </button>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="no-albums">This photo is not in any albums.</p>
        )}
        {isOwner && (
          <Link to={`/photos/${photo.id}/add-to-album`} className="btn btn-add-to-album">
            <FiPlus /> Add to Album
          </Link>
        )}
      </div>

      <div className="photo-comments">
        <h3>Comments</h3>
        <CommentList comments={photo.comments} photoId={photo.id} />
        {user && <CommentForm photoId={photo.id} />}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Photo"
      >
        <p>Are you sure you want to delete this photo? This action cannot be undone.</p>
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

export default PhotoDetail;
