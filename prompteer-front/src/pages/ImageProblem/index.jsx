import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import './ImageProblem.css';

const ImageProblem = () => {
  const { id } = useParams();
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 문제 데이터
  const problemData = {
    title: 'Challenge #11\n일상 풍경 묘사 프롬프트 만들기',
    category: '이미지',
    difficulty: '초급',
    sections: [
      {
        title: '📝 상황 설명',
        content: '당신은 적절한 프롬프트를 입력하여 이미지를 생성하고자 합니다.\r다음 조건에 따라 프롬프트를 작성해보세요.'
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
        content: ' 주요 시각 요소와 분위기를 모두 포함한 프롬프트를 작성하세요. 단순 나열이 아닌 자연스럽고 상세한 서술형 프롬프트를 작성할 것.',
        width: 311
      },
      {
        title: '🖍️ 채점방식',
        content: '채점 방식: 커뮤니티 평가 100%',
        width: 311
      }
    ]
  };

  const handleGenerate = () => {
    if (!promptText.trim()) return;
    
    setIsGenerating(true);
    // 임시 생성 로직
    setTimeout(() => {
      setIsGenerating(false);
      // 실제로는 여기서 이미지 생성 결과를 처리
      alert('이미지 생성이 완료되었습니다!');
    }, 1500);
  };

  return (
    <div className="image-problem-page">
      <Header />
      <div className="body-section">
        <div className="container">
          <div className="main-layout">
            {/* Frame 34: 좌측 문제 정보 */}
            <div className="frame-34">
              <div className="problem-header-section">
                <h1 className="problem-title">{problemData.title}</h1>
              </div>
              
              <div className="problem-tags">
                <div className="tag category-tag">
                  <span className="tag-text">{problemData.category}</span>
                </div>
                <div className="tag difficulty-tag">
                  <span className="tag-text">{problemData.difficulty}</span>
                </div>
              </div>

              <div className="problem-sections">
                {problemData.sections.map((section, index) => (
                  <div key={index} className="problem-section">
                    <div className={`section-header ${section.width ? 'constrained' : ''}`}>
                      <h3 className="section-title">{section.title}</h3>
                    </div>
                    <div className={`section-content ${section.width ? 'constrained' : ''}`}>
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
                    />
                  </div>
                </div>
                <div className="action-bar">
                  <button 
                    className="generate-btn"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <span>{isGenerating ? '생성 중...' : '이미지 생성'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Frame 56: 우측 하단 미리보기 영역 */}
            <div className="frame-56">
              <div className="preview-content">
                <div className="preview-message">
                  <p>'이미지 생성' 버튼을 눌러<br />AI가 생성한 이미지를 확인하세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ImageProblem;