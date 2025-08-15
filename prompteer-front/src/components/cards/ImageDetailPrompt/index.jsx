import React from "react";
import "./ImageDetailPrompt.css";

// 이미지 챌린지 상세 프롬프트 기록(모달) 보여주는 컴포넌트

const ImageDetailPrompt = ({ isOpen, onClose, imageData }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-detail-modal-overlay" onClick={handleBackdropClick}>
      <div className="image-detail-modal">
        <div className="modal-content">
          <div className="content-sections">
            {/* 이미지/영상 섹션 - 왼쪽 */}
            <div className="image-section">
              <div className="image-container">
                <img
                  src={
                    imageData?.imageUrl || "https://via.placeholder.com/450x681"
                  }
                  alt={imageData?.title || "이미지/영상"}
                  className="challenge-image"
                />
              </div>
            </div>

            {/* 프롬프트 및 좋아요 섹션 - 오른쪽 */}
            <div className="prompt-likes-container">
              {/* 프롬프트 패널 */}
              <div className="prompt-panel">
                <div className="panel-content">
                  {imageData?.prompt ||
                    "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details."}
                </div>
              </div>

              {/* 좋아요 섹션 */}
              <div className="likes-section">
                <span className="heart-icon">❤️</span>
                <span className="likes-count">{imageData?.likes || 10}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailPrompt;
