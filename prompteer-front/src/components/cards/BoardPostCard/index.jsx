import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BoardPostCard.css';

const BoardPostCard = ({ 
  id,
  title, 
  category, 
  problemNumber, 
  author, 
  comments, 
  likes, 
  date
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // 프롬포트 공유 게시물인 경우 다른 페이지로 이동
    if (category === '프롬포트' || title.includes('프롬포트') || title.includes('공유')) {
      navigate(`/board/shared/${id}`);
    } else {
      navigate(`/board/post/${id}`);
    }
  };

  return (
    <div className="board-post-card" onClick={handleClick}>
      <div className="board-post-content">
        <h3 className="board-post-title">{title}</h3>
      </div>
      <div className="board-post-stats">
        <div className="stat-item">
          <div className="board-post-category">
            <span className="category-text">{category}</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-value">{problemNumber}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{author}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{comments}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{likes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{date}</span>
        </div>
      </div>
    </div>
  );
};

export default BoardPostCard;