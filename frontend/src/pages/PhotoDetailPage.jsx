import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiEdit2, FiTrash, FiPlus, FiArrowLeft, FiMessageCircle, FiHeart, FiShare2 } from 'react-icons/fi';
import { getPhotoById, deletePhoto, } from '../api/photos';
import { createComment, getPhotoComments } from '../api/comments';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/ui/Modal';
import CommentSection from '../components/CommentSection';
import './PhotoDetailPage.css';

const PhotoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [photo, setPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPhotoData = async () => {
      try {
        setLoading(true);
        const photoData = await getPhotoById(id);
        setPhoto(photoData);
        
        // Fetch comments
        const commentsData = await getPhotoComments(id);
        setComments(commentsData);
      } catch (err) {
        console.error('Error fetching photo:', err);
        setError('Failed to load photo. It may have been deleted or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoData();
  }, [id]);

  const isOwner = user && photo?.user_id === user.id;

  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await deletePhoto(id);
      setShowDeleteModal(false);
      navigate('/photos');
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Failed to delete photo. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;
    
    try {
      setSubmittingComment(true);
      const comment = await createComment(id, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="photo-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading photo...</p>
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="photo-detail-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Photo not found'}</p>
          <button 
            className="button button-primary" 
            onClick={() => navigate('/photos')}
          >
            <FiArrowLeft /> Return to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-detail-page">
      <div className="photo-header">
        <div className="back-button-container">
          <button onClick={() => navigate(-1)} className="button button-text">
            <FiArrowLeft /> Back
          </button>
        </div>
        <h1 className="photo-title">{photo.title}</h1>
        
        {isOwner && (
          <div className="photo-actions">
            <button 
              className="button button-delete" 
              onClick={() => setShowDeleteModal(true)}
            >
              <FiTrash /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="photo-content">
        <div className="photo-image-container">
          <img 
            src={`http://localhost:8000/${photo.file_path}`}
            alt={photo.title}
            className="photo-image"
          />
        </div>
        
        <div className="photo-info">
          <div className="photo-metadata">
            <div className="photo-author">
              By <Link to={`/users/${photo.user_id}`}>{photo.user?.username || 'Unknown'}</Link>
            </div>
            <div className="photo-date">
              {format(new Date(photo.created_at), 'MMMM d, yyyy')}
            </div>
          </div>

          {photo.description && (
            <div className="photo-description">
              <p>{photo.description}</p>
            </div>
          )}
          
          <div className="photo-interaction">
            
            <button className="interaction-button">
              <FiMessageCircle /> {comments.length}
            </button>
          </div>
          
          <div className="album-info">
            {photo.albums && photo.albums.length > 0 ? (
              <div className="photo-albums">
                <h3>In Albums:</h3>
                <div className="album-list">
                  {photo.albums.map(album => (
                    <Link 
                      key={album.id} 
                      to={`/albums/${album.id}`}
                      className="album-link"
                    >
                      {album.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : isOwner ? (
              <div className="add-to-album">
                <Link to={`/photos/${photo.id}/add-to-albums`} className="button button-secondary">
                  <FiPlus /> Добавить в альбом
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      <div className="comments-section">
        <h2>Комментарии ({comments.length})</h2>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              placeholder="Добавить комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
              rows="3"
              required
            ></textarea>
            <button 
              type="submit" 
              className="button button-primary"
              disabled={submittingComment || !newComment.trim()}
            >
              {submittingComment ? 'Posting...' : 'Опубликовать'}
            </button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>Пожалуйста, <Link to="/login">войдите</Link> чтобы оставлять комментарии.</p>
          </div>
        )}
        
        <CommentSection comments={comments} photoId={photo.id} />
      </div>

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Delete Photo"
      >
        <div className="delete-modal-content">
          <p>Are you sure you want to delete this photo? This action cannot be undone.</p>
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
    </div>
  );
};

export default PhotoDetailPage;
