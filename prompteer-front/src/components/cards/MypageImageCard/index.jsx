import React from "react";
import { getImageProps } from "../../../utils/imageUrlHelper";
import "./MypageImageCard.css";

// mypage에 들어가는 단순화된 이미지 카드 컴포넌트

const MypageImageCard = ({
  challengeId,
  title,
  description,
  type,
  difficulty,
  imageUrl,
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
      {/* 이미지 영역 */}
      <div className="mypage-image-card-media">
        {imageUrl ? (
          type === "영상" ? (
            <video
              className="challenge-media"
              {...getImageProps(imageUrl)}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              className="challenge-media"
              {...getImageProps(imageUrl)}
              alt={`Challenge ${challengeId}`}
            />
          )
        ) : (
          <div className="no-media-placeholder">
            <span>{type === "영상" ? "영상 없음" : "이미지 없음"}</span>
          </div>
        )}
        {/* 타입 라벨 */}
        <div
          className="type-label"
          style={{ backgroundColor: getTypeColor(type) }}
        >
          {type}
        </div>
      </div>
      
      {/* 텍스트 콘텐츠 영역 */}
      <div className="mypage-image-card-content">
        <div className="challenge-info">
          <div className="challenge-id">Challenge #{challengeId}</div>
          <h3 className="challenge-title">{title}</h3>
          <p className="challenge-description">{description}</p>
        </div>
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
