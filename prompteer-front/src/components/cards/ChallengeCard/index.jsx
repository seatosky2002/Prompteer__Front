import React from 'react';
import './ChallengeCard.css';

const ChallengeCard = ({ 
  challengeId, 
  title, 
  description, 
  difficulty = '고급',
  participants = 1043,
  category = '코딩',
  onClick 
}) => {
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case '초급': return 'difficulty-beginner';
      case '중급': return 'difficulty-intermediate';
      case '고급': return 'difficulty-advanced';
      default: return 'difficulty-advanced';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case '코딩': return '#E7F5FF';
      case '그림': return '#E3F2FD';
      case '영상': return '#FFF3E0';
      case '탈옥': return '#FCE4EC';
      case '문서': return '#F3E5F5';
      default: return '#E7F5FF';
    }
  };

  return (
    <div className="challenge-card" onClick={onClick}>
      <div className="challenge-card-header">
        <div className="challenge-title-section">
          <h3 className="challenge-card-title">{title}</h3>
        </div>
        <div 
          className="challenge-category" 
          style={{ backgroundColor: getCategoryColor(category) }}
        >
          {category}
        </div>
      </div>
      
      <div className="challenge-content">
        <div className="challenge-description">
          <p className="challenge-desc-text">{description}</p>
        </div>
      </div>
      
      <div className="challenge-footer">
        <div className="challenge-difficulty">
          <span className={`difficulty-badge ${getDifficultyClass(difficulty)}`}>
            {difficulty}
          </span>
        </div>
        
        <div className="challenge-stats">
          <div className="participants-info">
            <span className="participants-text">
              🧑 {participants.toLocaleString()}명 참가 중
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;