import React from "react";
import "./MypageCodingCard.css";

// mypage에 들어가는 단순화된 코딩 카드 컴포넌트

const MypageCodingCard = ({
  challengeNumber,
  title,
  difficulty = "고급",
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

  return (
    <div className="mypage-coding-card" onClick={onClick}>
      <div className="mypage-coding-header">
        <h3 className="mypage-coding-title">
          Challenge #{challengeNumber}
          <br />
          {title}
        </h3>
      </div>
      <div className="mypage-coding-footer">
        <div
          className="mypage-difficulty-tag"
          style={{ backgroundColor: getDifficultyColor(difficulty) }}
        >
          <span className="mypage-difficulty-text">{difficulty}</span>
        </div>
      </div>
    </div>
  );
};

export default MypageCodingCard;
