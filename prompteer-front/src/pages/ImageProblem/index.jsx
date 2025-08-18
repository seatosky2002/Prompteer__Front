import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import './ImageProblem.css';

const ImageProblem = () => {
  const { id } = useParams();
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [showOthersImages, setShowOthersImages] = useState(true); // 기본값을 true로 변경
  const [sortBy, setSortBy] = useState('likes'); // 'likes' or 'random'
  const [imageLikes, setImageLikes] = useState(Array.from({ length: 8 }, () => 10)); // 각 이미지별 좋아요 수
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 모달 상태

  // 문제 데이터
  const problemData = {
    title: 'Challenge #11\n일상 풍경 묘사 프롬프트 만들기',
    category: '이미지',
    difficulty: '초급',
    sections: [
      {
        title: '📝 상황 설명',
        content: '당신은 적절한 프롬프트를 입력하여 이미지를 생성하고자 합니다. 다음 조건에 따라 프롬프트를 작성해보세요.'
      },
      {
        title: '🏞️ 장면',
        content: '비 오는 날의 카페 거리'
      },
      {
        title: '🎨 스타일 & 주요 요소',
        content: '비 오는 날의 카페 거리, 커피잔, 우산을 든 사람들, 젖은 바닥 반사광'
      },
      {
        title: '📜 목표',
        content: '주요 시각 요소와 분위기를 모두 포함한 프롬프트를 작성하세요. 단순 나열이 아닌 자연스럽고 상세한 서술형 프롬프트를 작성할 것.'
      },
      {
        title: '🖍️ 채점방식',
        content: '채점 방식: 커뮤니티 평가 100%'
      }
    ]
  };

  const handleGenerate = () => {
    if (!promptText.trim()) {
      alert('프롬프트를 입력해주세요!');
      return;
    }
    
    setIsGenerating(true);
    // 임시 생성 로직
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1500);
  };

  const handleRetry = () => {
    setPromptText('');
    setIsGenerated(false);
    // showOthersImages는 항상 true 유지
  };

  const handleNewProblem = () => {
    // 다른 문제로 이동하는 로직
    window.location.href = '/coding/';
  };

  const handleShare = () => {
    // 프롬프트 공유 로직
    alert('프롬프트가 게시판에 공유되었습니다!');
  };

  const handleLikeClick = (index) => {
    setImageLikes(prevLikes => {
      const newLikes = [...prevLikes];
      newLikes[index] += 1;
      return newLikes;
    });
  };

  const handleImageClick = (index) => {
    setSelectedImage({
      id: index,
      image: `이미지 ${index + 1}`,
      prompt: `A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.`,
      likes: imageLikes[index]
    });
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // toggleOthersImages 함수 제거 - 항상 표시되므로 불필요

  return (
    <div className="image-problem-page">
      <Header />
      <div className="body-section">
        <div className="container">
          <div className="main-layout">
            {/* Frame 34: 좌측 문제 정보 */}
            <div className="frame-34">
              <div className="problem-header">
                <div className="problem-title-section">
                  <h1 className="problem-title">{problemData.title}</h1>
                </div>
                <div className="problem-tags">
                  <div className="tags-row">
                    <div className="tag category-tag">
                      <span>{problemData.category}</span>
                    </div>
                    <div className="tag difficulty-tag">
                      <span>{problemData.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="problem-content">
                {problemData.sections.map((section, index) => (
                  <div key={index} className="problem-section">
                    <div className="section-header">
                      <h3 className="section-title">{section.title}</h3>
                    </div>
                    <div className="section-content">
                      <p className="section-text">{section.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frame 50: 우측 상단 프롬프트 입력 영역 */}
            <div className="frame-50">
              <div className="prompt-container">
                <div className="prompt-editor">
                  <div className="editor-frame">
                    <textarea
                      className="prompt-textarea"
                      placeholder="이곳에 이미지 생성 프롬프트를 작성하세요..."
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      readOnly={isGenerated}
                    />
                  </div>
                </div>
                {!isGenerated && (
                  <div className="action-bar">
                    <button 
                      className="generate-btn"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      <span>{isGenerating ? '생성 중...' : '이미지 생성'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Frame 56: 우측 하단 미리보기 영역 */}
            <div className="frame-56">
              <div className="preview-content">
                {!isGenerated ? (
                  <div className="preview-message">
                    <p>'이미지 생성' 버튼을 눌러<br />AI가 생성한 이미지를 확인하세요.</p>
                  </div>
                ) : (
                  <>
                    <div className="generated-result">
                      <div className="generated-image-placeholder">
                        {/* 실제로는 생성된 이미지가 표시됩니다 */}
                        <div className="image-placeholder">생성된 이미지</div>
                      </div>
                    </div>
                    {/* 결과 버튼 바 - 피그마 44-2711 */}
                    <div className="result-action-bar">
                      <button className="result-action-btn" onClick={handleRetry}>
                        <span>다시 풀기</span>
                      </button>
                      <button className="result-action-btn" onClick={handleNewProblem}>
                        <span>다른 문제 풀기</span>
                      </button>
                      <button className="result-action-btn" onClick={handleShare}>
                        <span>프롬프트 공유하기</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* 하단 안내 문구 */}
          {isGenerated && (
            <div className="result-notice">
              <p>*문제의 프롬포트와 그림은 해당 문제를 푼 도전자에게 모두 공개됩니다.</p>
              <p>*프롬프트 공유하기는 해당 문제를 풀지 않아도, 모든 사람을 대상으로 게시판에 공유하는 것을 말합니다.</p>
            </div>
          )}
        </div>

        {/* 구경하기 섹션 - 기존 레이아웃을 밀어내지 않도록 별도 컨테이너 */}
        {isGenerated && (
          <div className="others-section-wrapper">
            <div className="others-section">
              <div className="others-container">
                <div className="others-header">
                  <h2 className="others-title">구경하기</h2>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-btn ${sortBy === 'likes' ? 'active' : ''}`}
                      onClick={() => setSortBy('likes')}
                    >
                      좋아요순
                    </button>
                    <button 
                      className={`filter-btn ${sortBy === 'random' ? 'active' : ''}`}
                      onClick={() => setSortBy('random')}
                    >
                      랜덤순
                    </button>
                  </div>
                </div>
                
                <div className="others-grid">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="other-image-card">
                      <div 
                        className="other-image-placeholder"
                        onClick={() => handleImageClick(i)}
                        style={{ cursor: 'pointer' }}
                      >
                        이미지 {i + 1}
                      </div>
                      <div className="image-likes">
                        <span 
                          className="heart" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeClick(i);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          ❤️
                        </span>
                        <span className="like-count">{imageLikes[i]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 이미지 모달 */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={handleCloseModal}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-image-section">
                <div className="modal-image-placeholder">
                  {selectedImage.image}
                </div>
              </div>
              <div className="modal-prompt-section">
                <div className="modal-prompt-content">
                  <p className="modal-prompt-text">{selectedImage.prompt}</p>
                </div>
                <div className="modal-likes">
                  <span className="modal-heart">❤️</span>
                  <span className="modal-like-count">{selectedImage.likes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default ImageProblem;