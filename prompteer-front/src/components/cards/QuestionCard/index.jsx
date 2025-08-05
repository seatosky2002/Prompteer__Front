import React from 'react';
import './QuestionCard.css';

const QuestionCard = ({ question, category, likes, author, views, date }) => {
  return (
    <div className="question-card">
      <div className="question-header">
        <h3 className="question-title">{question}</h3>
        <div className="category-tag">
          <span className="category-text">{category}</span>
        </div>
      </div>
      <div className="question-stats">
        <div className="stat-item">
          <span className="stat-label">코딩 질문</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{likes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value author">{author}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{views}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{likes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-value date">{date}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;