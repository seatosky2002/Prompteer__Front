import React from 'react';
import './SimpleCodingCard.css';

const SimpleCodingCard = ({ challengeNumber, title, difficulty = '고급' }) => {
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
    <div className="simple-coding-card">
      <div className="simple-coding-header">
        <h3 className="simple-coding-title">
          Challenge #{challengeNumber}
          <br />
          {title}
        </h3>
      </div>
      <div className="simple-coding-footer">
        <div 
          className="simple-difficulty-tag" 
          style={{ backgroundColor: getDifficultyColor(difficulty) }}
        >
          <span className="simple-difficulty-text">{difficulty}</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleCodingCard;