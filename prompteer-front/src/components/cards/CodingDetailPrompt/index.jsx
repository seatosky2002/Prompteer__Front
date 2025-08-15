import React from "react";
import "./CodingDetailPrompt.css";

// 코딩 챌린지 상세 프롬프트 기록(모달) 보여주는 컴포넌트

const CodingDetailPrompt = ({ isOpen, onClose, challengeData }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="coding-detail-modal-overlay" onClick={handleBackdropClick}>
      <div className="coding-detail-modal">
        {/* 모달 내용 */}
        <div className="modal-content">
          {/* 4개 요소 가로 배치 */}
          <div className="content-sectionss">
            {/* 성능 정보 - 왼쪽 */}
            <div className="performance-section">
              <div className="performance-info">
                <div className="performance-item">
                  <span className="performance-label">사용 메모리</span>
                  <span className="performance-value">
                    {challengeData?.memory || "3024KB"}
                  </span>
                </div>
                <div className="performance-item">
                  <span className="performance-label">소요 시간</span>
                  <span className="performance-value">
                    {challengeData?.time || "68ms"}
                  </span>
                </div>
                <div className="performance-item">
                  <span className="performance-label">수동 수정</span>
                  <span className="performance-value">
                    {challengeData?.manualEdits || "2회"}
                  </span>
                </div>
              </div>
            </div>

            {/* 프롬프트 패널 - 중앙 왼쪽 */}
            <div className="prompt-panel">
              <div className="panel-content">
                {challengeData?.prompt ||
                  "BFS 알고리즘을 사용해서 그래프의 최단 경로를 찾는 문제입니다. 주어진 그래프에서 시작점에서 도착점까지의 최단 거리를 계산하세요."}
              </div>
            </div>

            {/* 실행 결과 패널 - 중앙 오른쪽 */}
            <div className="output-panel">
              <div className="panel-content">
                <pre className="output-code">
                  {challengeData?.output || "> 1\n> 6\n> 3\n> 30"}
                </pre>
              </div>
            </div>

            {/* 좋아요 - 오른쪽 */}
            <div className="likes-section">
              <span className="heart-icon">❤️</span>
              <span className="likes-count">{challengeData?.likes || 10}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingDetailPrompt;
