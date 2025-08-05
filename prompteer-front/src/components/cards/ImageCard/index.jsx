import React from 'react';
import './ImageCard.css';

const ImageCard = ({ 
  challengeNumber, 
  title, 
  type = '이미지', 
  difficulty = '초급',
  backgroundImage 
}) => {
  const getDifficultyColor = (level) => {
    switch (level) {
      case '초급':
        return '#64BE75';
      case '중급':
        return '#FF9E42';
      case '고급':
        return '#FF6A6A';
      default:
        return '#64BE75';
    }
  };

  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    // 기본 그라데이션 배경
    return {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
  };

  return (
    <div className="image-card">
      <div 
        className="image-card-background"
        style={getBackgroundStyle()}
      >
        <div className="image-card-overlay">
          <div className="image-card-header">
            <div className="type-tag">
              <span className="type-text">{type}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="image-card-content">
        <div className="image-card-info">
          <div className="challenge-info">
            <h4 className="challenge-number">Challenge #{challengeNumber}</h4>
            <p className="challenge-title">{title}</p>
          </div>
          <div className="difficulty-tag" style={{ backgroundColor: getDifficultyColor(difficulty) }}>
            <span className="difficulty-text">{difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;