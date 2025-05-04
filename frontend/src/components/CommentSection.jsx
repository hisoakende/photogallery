import React, { useState } from 'react';
import { format } from 'date-fns';
import { FiMoreVertical, FiTrash, FiEdit } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { deleteComment, updateComment } from '../api/comments';
import './CommentSection.css';

const CommentSection = ({ comments, photoId }) => {
  const { user } = useAuth();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [processing, setProcessing] = useState(false);

  if (!comments || comments.length === 0) {
    return (
      <div className="no-comments">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  const handleEditClick = (comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
    setActiveMenu(null);
  };

  const handleDeleteClick = async (commentId) => {
    if (processing) return;
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      setProcessing(true);
      await deleteComment(photoId, commentId);
      // Remove the comment from the list
      // In a real app, you would likely use a state management solution or callback function
      // Here we're just hiding the comment in the UI as a simple solution
      document.getElementById(`comment-${commentId}`).style.display = 'none';
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setProcessing(false);
      setActiveMenu(null);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (processing || !editText.trim()) return;

    try {
      setProcessing(true);
      await updateComment(photoId, commentId, editText);
      // Update the comment text in the UI
      // In a real app, you would likely use a state management solution or callback function
      document.getElementById(`comment-text-${commentId}`).textContent = editText;
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    } finally {
      setProcessing(false);
      setEditingCommentId(null);
    }
  };

  const toggleMenu = (commentId) => {
    setActiveMenu(activeMenu === commentId ? null : commentId);
  };

  return (
    <div className="comments-list">
      {comments.map((comment) => (
        <div key={comment.id} id={`comment-${comment.id}`} className="comment">
          <div className="comment-header">
            <div className="comment-user-info">
              <img
                src="http://localhost:8000/uploads/default_ava.jpg"
                alt={comment.user?.username || 'User'}
                className="comment-avatar"
              />
              <div className="comment-metadata">
                <span className="comment-username">
                  {comment.user?.username || 'Unknown user'}
                </span>
                <span className="comment-date">
                  {format(new Date(comment.created_at), 'MMM d, yyyy • h:mm a')}
                </span>
              </div>
            </div>

            {user && (user.id === comment.user_id) && (
              <div className="comment-actions">
                <button
                  className="action-button"
                  onClick={() => toggleMenu(comment.id)}
                  aria-label="More options"
                >
                  <FiMoreVertical />
                </button>
                {activeMenu === comment.id && (
                  <div className="comment-menu">
                    <button
                      className="menu-item delete"
                      onClick={() => handleDeleteClick(comment.id)}
                    >
                      <FiTrash /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {editingCommentId === comment.id ? (
            <div className="edit-comment-form">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="edit-comment-input"
                rows="3"
              ></textarea>
              <div className="edit-actions">
                <button
                  className="button button-secondary"
                  onClick={() => setEditingCommentId(null)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  className="button button-primary"
                  onClick={() => handleUpdateComment(comment.id)}
                  disabled={processing || !editText.trim()}
                >
                  {processing ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p id={`comment-text-${comment.id}`} className="comment-text">
              {comment.text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentSection;
