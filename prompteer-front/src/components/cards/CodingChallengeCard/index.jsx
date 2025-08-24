import React from "react";
import "./CodingChallengeCard.css";

const CodingChallengeCard = ({ challenge, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(challenge);
    }
  };

  return (
    <div className="coding-challenge-card" onClick={handleClick}>
      {/* Frame 127 */}
      <div className="coding-frame-127">
        {/* Frame 22 */}
        <div className="coding-frame-22">
          <div className="coding-challenge-number">
            Challenge #{challenge.id || challenge.challengeId}
          </div>
          <h3 className="coding-challenge-title">{challenge.title}</h3>
        </div>
        {/* Frame 21 - Category Badge */}
        <div className="coding-frame-21">
          <span className="coding-category-text">{challenge.category}</span>
        </div>
      </div>

      {/* Frame 23 - Description */}
      <div className="coding-frame-23">
        <div className="coding-frame-24">
          <p className="coding-challenge-description-text">
            {challenge.description}
          </p>
        </div>
      </div>

      {/* Frame 25 - Difficulty */}
      <div className="coding-frame-25">
        <div className="coding-frame-26">
          <div
            className={`coding-frame-28 coding-difficulty-${challenge.difficulty}`}
          >
            <span className="coding-difficulty-text">
              {challenge.difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingChallengeCard;
