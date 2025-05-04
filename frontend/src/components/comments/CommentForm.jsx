import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { createComment, updateComment } from '../../api/comments';
import './CommentForm.css';

const CommentForm = ({ photoId, comment = null, onCommentAdded, onCommentUpdated, onCancel }) => {
  const [text, setText] = useState(comment ? comment.text : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isEditing = !!comment;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      if (isEditing) {
        const updatedComment = await updateComment(comment.id, { text });
        if (onCommentUpdated) {
          onCommentUpdated(updatedComment);
        }
        if (onCancel) {
          onCancel();
        }
      } else {
        const newComment = await createComment({ text, photo_id: photoId });
        if (onCommentAdded) {
          onCommentAdded(newComment);
        }
        setText('');
      }
    } catch (err) {
      console.error('Comment error:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      {error && <div className="comment-error">{error}</div>}
      
      <div className="comment-input-container">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="comment-input"
          rows="3"
          disabled={isSubmitting}
        />
        
        <div className="comment-form-actions">
          {isEditing && (
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting || !text.trim()}
          >
            <FiSend />
            {isSubmitting 
              ? isEditing ? 'Updating...' : 'Posting...' 
              : isEditing ? 'Update' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
