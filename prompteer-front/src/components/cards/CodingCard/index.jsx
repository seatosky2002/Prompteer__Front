import React from 'react';
import './CodingCard.css';

const CodingCard = ({ challengeNumber, title, description, difficulty = '고급' }) => {
  const getDifficultyColor = (level) => {
    switch (level) {
      case '초급':
        return '#64BE75';
      case '중급':
        return '#FF9E42';
      case '고급':
        return '#FF4E4E';
      default:
        return '#FF4E4E';
    }
  };

  return (
    <div className="coding-card">
      <div className="coding-card-header">
        <div className="coding-title-section">
          <h3 className="coding-title">
            Challenge #{challengeNumber}
            <br />
            {title}
          </h3>
        </div>
        <div className="category-tag">
          <span className="category-text">코딩</span>
        </div>
      </div>
      {description && (
        <div className="coding-description">
          <p>{description}</p>
        </div>
      )}
      <div className="coding-footer">
        <div className="difficulty-container">
          <div 
            className="difficulty-tag" 
            style={{ backgroundColor: getDifficultyColor(difficulty) }}
          >
            <span className="difficulty-text">{difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingCard;