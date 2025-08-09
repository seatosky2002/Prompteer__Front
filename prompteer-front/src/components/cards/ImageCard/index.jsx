import React from 'react';
import './ImageCard.css';

const ImageCard = ({ 
  challengeId, 
  title, 
  description, 
  category, 
  difficulty, 
  type,
  onClick 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(challengeId);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case '초급':
        return 'difficulty-beginner';
      case '중급':
        return 'difficulty-intermediate';
      case '고급':
        return 'difficulty-advanced';
      default:
        return 'difficulty-beginner';
    }
  };

  const getTypeLabel = (type) => {
    return type === 'image' ? '이미지' : '영상';
  };

  return (
    <div className="image-card" onClick={handleClick}>
      <div className="image-card-content">
        <div className="image-preview">
          <div className="image-placeholder">
            {/* 실제 구현시 이미지 표시 */}
            <div className="placeholder-icon">🖼️</div>
          </div>
          <div className="type-badge">
            <span className="type-label">{getTypeLabel(type)}</span>
          </div>
        </div>
        <div className="card-info">
          <div className="card-header">
            <div className="challenge-info">
              <h3 className="challenge-title">{title}</h3>
              <p className="challenge-description">{description}</p>
            </div>
            <div className="difficulty-badge">
              <span className={`difficulty-label ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;