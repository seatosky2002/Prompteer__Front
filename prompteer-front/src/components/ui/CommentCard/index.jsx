import React from 'react';
import './CommentCard.css';

const CommentCard = ({ content, author }) => {
  return (
    <div className="comment-card">
      <div className="comment-content">{content}</div>
      <div className="comment-author">{author}</div>
    </div>
  );
};

export default CommentCard;