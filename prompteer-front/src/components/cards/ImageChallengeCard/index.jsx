import React from "react";
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
        {imageUrl && (
          <img
            className="image-challenge-image"
            src={imageUrl}
            alt={`Challenge ${challenge.id || challenge.challengeId}`}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
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
