import React from "react";
import "./MypageImageCard.css";

// mypage에 들어가는 단순화된 이미지 카드 컴포넌트

const MypageImageCard = ({
  challengeId,
  title,
  description,
  type,
  difficulty,
  onClick,
}) => {
  const getDifficultyColor = (level) => {
    switch (level) {
      case "초급":
        return "#64BE75";
      case "중급":
        return "#FF9E42";
      case "고급":
        return "#FF4E4E";
      default:
        return "#FF4E4E";
    }
  };

  const getTypeColor = (challengeType) => {
    switch (challengeType) {
      case "이미지":
        return "#4A90E2";
      case "영상":
        return "#9B59B6";
      default:
        return "#4A90E2";
    }
  };

  return (
    <div className="mypage-image-card" onClick={onClick}>
      <div className="mypage-image-card-content">
        <div
          className="type-label"
          style={{ backgroundColor: getTypeColor(type) }}
        >
          {type}
        </div>
        <h3 className="challenge-title">{title}</h3>
        <p className="challenge-description">{description}</p>
        <div
          className="difficulty-label"
          style={{ backgroundColor: getDifficultyColor(difficulty) }}
        >
          {difficulty}
        </div>
      </div>
    </div>
  );
};

export default MypageImageCard;
