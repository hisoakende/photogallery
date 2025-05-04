import React from 'react';
import { format } from 'date-fns';
import { FiEdit2, FiTrash } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import './CommentList.css';

const CommentList = ({ comments, photoId, onDeleteComment, onEditComment }) => {
  const { user } = useAuth();

  if (!comments || comments.length === 0) {
    return (
      <div className="no-comments">
        No comments yet. Be the first to comment on this photo!
      </div>
    );
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => {
        const isAuthor = user && comment.user_id === user.id;
        
        return (
          <div key={comment.id} className="comment">
            <div className="comment-avatar">
              {comment.user.username.charAt(0).toUpperCase()}
            </div>
            <div className="comment-content">
              <div className="comment-header">
                <div className="comment-author">{comment.user.username}</div>
                <div className="comment-date">
                  {format(new Date(comment.created_at), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="comment-text">{comment.text}</div>
              
              {isAuthor && (
                <div className="comment-actions">
                  <button 
                    className="comment-action edit" 
                    onClick={() => onEditComment && onEditComment(comment)}
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button 
                    className="comment-action delete" 
                    onClick={() => onDeleteComment && onDeleteComment(comment.id)}
                  >
                    <FiTrash /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentList;
