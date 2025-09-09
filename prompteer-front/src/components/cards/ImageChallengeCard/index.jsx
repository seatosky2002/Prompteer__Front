import React from "react";
import { getImageProps } from "../../../utils/imageUrlHelper";
import "./ImageChallengeCard.css";

const ImageChallengeCard = ({ challenge, onClick, imageUrl }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(challenge);
    }
  };

  return (
    <div className="image-challenge-component" onClick={handleClick}>
      {/* Frame 17 - Main Card with Background Image */}
      <div className="image-frame-17">
        {/* Image Content */}
        {
          // 원래 버전

          imageUrl ? (
            <img
              className="image-challenge-image"
              {...getImageProps(imageUrl)}
              alt={`Challenge ${challenge.id || challenge.challengeId}`}
            />
          ) : (
            <div className="no-image-placeholder">
              <span>이미지 로딩 중...</span>
            </div>
          )
        }
        {
          // 하드코딩 버전
          /*<img
            className="image-challenge-image"
            src={challenge.category === "그림" ? "/image1.png" : "/image2.png"}
            alt={`Challenge ${challenge.id || challenge.challengeId}`}
          />*/
        }
        {/* Frame 21 - Category Badge (Top Right) */}
        <div className="image-frame-21">
          <span className="image-category-text">{challenge.category}</span>
        </div>
      </div>

      {/* Frame 108 - Bottom Text Section */}
      <div className="image-frame-108">
        {/* Frame 107 - Text Content */}
        <div className="image-frame-107">
          <div className="image-challenge-id">
            Challenge #{challenge.id || challenge.challengeId}
          </div>
          <h3 className="image-challenge-title">
            {challenge.title || "제목 없음"}
          </h3>
        </div>

        {/* Frame 27 - Difficulty Badge */}
        <div
          className={`image-frame-27 image-difficulty-${challenge.difficulty}`}
        >
          <span className="image-difficulty-text">{challenge.difficulty}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageChallengeCard;
