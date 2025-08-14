import React from "react";
import "./MypageQuestionCard.css";

const MypageQuestionCard = ({
  question,
  category,
  likes,
  author,
  views,
  date,
}) => {
  return (
    <div className="mypage-question-card">
      <div className="mypage-question-header">
        <h3 className="mypage-question-title">{question}</h3>
        <span className="category-text">{category}</span>
      </div>
      <div className="mypage-question-stats">
        <div className="stat-item">
          <span className="stat-label">좋아요</span>
          <span className="stat-value">{likes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">작성자</span>
          <span className="stat-value">{author}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">조회수</span>
          <span className="stat-value">{views}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">날짜</span>
          <span className="stat-value date">{date}</span>
        </div>
      </div>
    </div>
  );
};

export default MypageQuestionCard;
