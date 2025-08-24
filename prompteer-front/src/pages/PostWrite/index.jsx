import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import FilterButton from '../../components/ui/FilterButton/index.jsx';
import CategoryFilter from '../../components/ui/CategoryFilter/index.jsx';
import './PostWrite.css';

const PostWrite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // state 변수들을 먼저 선언
  const [isImageChallenge, setIsImageChallenge] = useState(false);
  const [isVideoChallenge, setIsVideoChallenge] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [activeTab, setActiveTab] = useState('게시물 작성');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [contentViewMode, setContentViewMode] = useState('edit'); // 'edit' or 'preview'
  
  // 폼 상태 관리 - 초기값은 동적으로 설정됨
  const [formData, setFormData] = useState({
    title: '',
    boardCategory: '질문', // 초기값, useEffect에서 조건에 따라 변경됨
    problemCategory: '코딩', // 코딩, 그림, 영상, 탈옥, 문서
    problemNumber: '',
    content: ''
  });

  // useEffect를 사용하여 페이지 이동 시 전달받은 state로 폼 데이터 초기화
  useEffect(() => {
    console.log('PostWrite useEffect - location.state:', location.state);
    if (location.state) {
      const { problemId, initialContent, category, boardCategory, promptText, generatedImageUrl, generatedVideoUrl } = location.state;
      console.log('PostWrite - 받은 데이터:', { problemId, initialContent, category, boardCategory, promptText, generatedImageUrl, generatedVideoUrl });

      // 이미지 챌린지에서 온 경우 특별 처리
      if (category === 'image' && promptText && generatedImageUrl) {
        console.log('이미지 챌린지 데이터 처리 중...', { category, promptText, generatedImageUrl });
        setIsImageChallenge(true);
        setImageData({
          prompt: promptText,
          imageUrl: generatedImageUrl
        });
        
        // 이미지 챌린지용 내용 구성
        const imageContent = `### 🎨 프롬프트\n\n${promptText}\n\n### 🖼️ 생성된 이미지\n\n![Generated Image](${generatedImageUrl})\n\n---\n*이미지 챌린지 #${problemId}에서 생성된 프롬프트와 이미지입니다.*`;
        
        setFormData(prev => {
          const newFormData = {
            ...prev,
            title: `이미지 챌린지 #${problemId} - 프롬프트 공유`,
            problemNumber: problemId || prev.problemNumber,
            content: imageContent,
            problemCategory: '그림',
            boardCategory: '프롬프트 공유',
          };
          
          console.log('새로운 폼 데이터:', newFormData);
          return newFormData;
        });
      } else if (category === 'video' && promptText && generatedVideoUrl) {
        // 비디오 챌린지에서 온 경우 특별 처리
        console.log('비디오 챌린지 데이터 처리 중...', { category, promptText, generatedVideoUrl });
        setIsImageChallenge(false); // 이미지 챌린지가 아님
        setIsVideoChallenge(true); // 비디오 챌린지임
        setImageData(null);
        setVideoData({
          prompt: promptText,
          videoUrl: generatedVideoUrl
        });
        
        // 비디오 챌린지용 내용 구성
        const videoContent = `### 🎬 프롬프트\n\n${promptText}\n\n### 🎥 생성된 영상\n\n[영상 파일](${generatedVideoUrl})\n\n---\n*비디오 챌린지 #${problemId}에서 생성된 프롬프트와 영상입니다.*`;
        
        setFormData(prev => {
          const newFormData = {
            ...prev,
            title: `비디오 챌린지 #${problemId} - 프롬프트 공유`,
            problemNumber: problemId || prev.problemNumber,
            content: videoContent,
            problemCategory: '영상',
            boardCategory: '프롬프트 공유',
          };
          
          console.log('새로운 폼 데이터:', newFormData);
          return newFormData;
        });
      } else {
        // 일반적인 경우 (챌린지에서 온 경우)
        setFormData(prev => ({
          ...prev,
          problemNumber: problemId || prev.problemNumber,
          content: initialContent || prev.content,
          problemCategory: category === 'coding' ? '코딩' : category === 'image' ? '그림' : category === 'video' ? '영상' : prev.problemCategory,
          boardCategory: boardCategory || '프롬프트 공유', // 챌린지에서 온 경우 프롬프트 공유 가능
        }));
      }
    }
  }, [location.state]);

  // 챌린지/게시판 구분에 따른 기본 boardCategory 설정
  useEffect(() => {
    const isFromChallenge = !!(location.state?.problemId || location.state?.generatedImageUrl || location.state?.generatedVideoUrl);
    
    // 챌린지에서 온 경우가 아니고, 현재 boardCategory가 기본값인 경우에만 설정
    if (!isFromChallenge && formData.boardCategory === '질문') {
      // 게시판에서 직접 온 경우 - 질문이 기본값 (이미 설정됨)
    } else if (isFromChallenge && formData.boardCategory === '질문' && !location.state?.boardCategory) {
      // 챌린지에서 온 경우 - 프롬프트 공유가 기본값
      setFormData(prev => ({
        ...prev,
        boardCategory: '프롬프트 공유'
      }));
    }
  }, [location.state, formData.boardCategory]);

  // formData 변경 시 로그 출력
  useEffect(() => {
    console.log('formData 변경됨:', formData);
    console.log('isImageChallenge:', isImageChallenge);
  }, [formData, isImageChallenge]);

  const tabs = ['전체', '질문', '프롬프트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상'];
  
  // 게시판에서 직접 온 경우 vs 챌린지에서 온 경우 구분
  const isFromChallenge = !!(location.state?.problemId || location.state?.generatedImageUrl || location.state?.generatedVideoUrl);
  const boardCategories = ['질문', '프롬프트 공유']; // 항상 두 옵션 모두 표시
  const problemCategories = ['코딩', '그림', '영상'];

  // 입력 필드 변경 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (type, category) => {
    setFormData(prev => ({
      ...prev,
      [type]: category
    }));
  };

  const handleFilterNavigate = (filterType, value) => {
    const typeMapping = { '질문': 'question', '프롬프트 공유': 'share' };
    const tagMapping = { '코딩': 'ps', '이미지': 'img', '영상': 'video' };

    const params = new URLSearchParams();
    if (filterType === 'type' && value !== '전체') {
      params.set('type', typeMapping[value]);
    } else if (filterType === 'tag' && value !== '전체') {
      params.set('tag', tagMapping[value]);
    }
    
    navigate(`/board?${params.toString()}`);
  };

  // 게시글 작성 제출
  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      return;
    }

    // Frontend-to-Backend Enum Mapping
    const typeMapping = {
      '질문': 'question',
      '프롬프트 공유': 'share'
    };

    const tagMapping = {
      '코딩': 'ps',
      '그림': 'img',
      '영상': 'video'
    };

    const payload = {
      type: typeMapping[formData.boardCategory],
      tag: tagMapping[formData.problemCategory],
      title: formData.title,
      content: formData.content,
      challenge_id: formData.problemNumber || null, // challenge ID 추가
      attachment_urls: [] // 현재 첨부파일 기능은 없으므로 빈 배열
    };

    // tag가 유효하지 않은 경우, 요청을 보내지 않음
    if (!payload.tag) {
        alert(`'${formData.problemCategory}' 카테고리는 현재 게시글 작성을 지원하지 않습니다.`);
        return;
    }

    try {
      const response = await fetch('http://localhost:8000/posts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '게시글 작성에 실패했습니다.');
      }

      alert('게시글이 성공적으로 작성되었습니다!');
      navigate('/board'); // 성공 후 게시판으로 이동

    } catch (error) {
      console.error("Post creation error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="post-write-page">
      <Header />
      <main className="post-write-main">
        <div className="post-write-container">
          {/* 페이지 헤더 */}
          <div className="post-write-header">
            <div className="post-write-title-section">
              <h1 className="post-write-title">게시판</h1>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="post-write-content">
            {/* 필터 섹션 */}
            <div className="post-write-filters">
              <div className="tab-filters">
                <div className="tab-buttons">
                  {tabs.map((tab) => (
                    <FilterButton
                      key={tab}
                      isActive={activeTab === tab}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </FilterButton>
                  ))}
                </div>
                <FilterButton variant="action" isActive={true}>
                  게시물 작성
                </FilterButton>
              </div>

              <div className="category-filter-section">
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </div>
            </div>

            {/* 작성 폼 */}
            <div className="post-write-form">
              <div className="form-card-background"></div>
              <div className="form-card-content">
                <div className="form-sections">
                  {/* 제목 */}
                  <div className="form-section">
                    <label className="form-label">제목</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="제목을 입력하세요"
                    />
                  </div>

                  {/* 게시판 카테고리 */}
                  <div className="form-section">
                    <label className="form-label">게시판 카테고리</label>
                    <div className="category-buttons">
                      {boardCategories.map((category) => (
                        <button
                          key={category}
                          className={`category-btn ${formData.boardCategory === category ? 'active' : ''} ${
                            (!isFromChallenge && category === '프롬프트 공유') || 
                            (isFromChallenge && category === '질문') ? 'disabled' : ''
                          }`}
                          onClick={() => handleCategorySelect('boardCategory', category)}
                          disabled={
                            (!isFromChallenge && category === '프롬프트 공유') || 
                            (isFromChallenge && category === '질문')
                          }
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 문제 카테고리 */}
                  <div className="form-section">
                    <label className="form-label">문제 카테고리</label>
                    <div className="category-buttons">
                      {problemCategories.map((category) => {
                        // 챌린지에서 온 경우 해당 카테고리만 활성화
                        const shouldDisable = isFromChallenge && (
                          (location.state?.category === 'coding' && category !== '코딩') ||
                          (location.state?.category === 'image' && category !== '그림') ||
                          (location.state?.category === 'video' && category !== '영상')
                        );
                        
                        return (
                          <button
                            key={category}
                            className={`category-btn ${formData.problemCategory === category ? 'active' : ''} ${shouldDisable ? 'disabled' : ''}`}
                            onClick={() => handleCategorySelect('problemCategory', category)}
                            disabled={shouldDisable}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 문제 번호 */}
                  <div className="form-section">
                    <label className="form-label">문제 번호</label>
                    <input
                      type="text"
                      className="form-input form-input-small"
                      value={formData.problemNumber}
                      onChange={(e) => handleInputChange('problemNumber', e.target.value)}
                      placeholder="예: 13"
                      disabled={!!location.state?.problemId}
                    />
                  </div>

                  {/* 프롬프트와 이미지/영상 버튼 (이미지/비디오 챌린지에서 온 경우만) */}
                  {(isImageChallenge || isVideoChallenge) && (
                    <div className="form-section">
                      <div className="content-view-toggle">
                        <button
                          type="button"
                          className={`toggle-btn ${contentViewMode === 'edit' ? 'active' : ''}`}
                          onClick={() => setContentViewMode('edit')}
                        >
                          프롬프트
                        </button>
                        <button
                          type="button"
                          className={`toggle-btn ${contentViewMode === 'preview' ? 'active' : ''}`}
                          onClick={() => setContentViewMode('preview')}
                        >
                          {isImageChallenge ? '이미지' : '영상'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 내용 */}
                  {isImageChallenge ? (
                    <>
                      {/* 프롬프트와 이미지 편집/미리보기 */}
                      <div className="form-section form-section-content">
                        <div className="content-input-wrapper">
                          {contentViewMode === 'edit' ? (
                            <textarea
                              className="form-textarea prompt-textarea"
                              value={imageData?.prompt || ''}
                              onChange={(e) => {
                                setImageData(prev => ({ ...prev, prompt: e.target.value }));
                                // 전체 내용도 업데이트
                                const newContent = `### 🎨 프롬프트\n\n${e.target.value}\n\n### 🖼️ 생성된 이미지\n\n![Generated Image](${imageData?.imageUrl || ''})\n\n---\n*이미지 챌린지 #${formData.problemNumber}에서 생성된 프롬프트와 이미지입니다.*`;
                                handleInputChange('content', newContent);
                              }}
                              placeholder="프롬프트를 입력하세요..."
                              rows={12}
                            />
                          ) : (
                            <div className="image-preview-wrapper">
                              {imageData?.imageUrl ? (
                                <img 
                                  src={imageData.imageUrl} 
                                  alt="Generated Image" 
                                  className="generated-image-preview"
                                />
                              ) : (
                                <div className="image-placeholder">이미지가 없습니다</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : isVideoChallenge ? (
                    <>
                      {/* 프롬프트와 영상 편집/미리보기 */}
                      <div className="form-section form-section-content">
                        <div className="content-input-wrapper">
                          {contentViewMode === 'edit' ? (
                            <textarea
                              className="form-textarea prompt-textarea"
                              value={videoData?.prompt || ''}
                              onChange={(e) => {
                                setVideoData(prev => ({ ...prev, prompt: e.target.value }));
                                // 전체 내용도 업데이트
                                const newContent = `### 🎬 프롬프트\n\n${e.target.value}\n\n### 🎥 생성된 영상\n\n[영상 파일](${videoData?.videoUrl || ''})\n\n---\n*비디오 챌린지 #${formData.problemNumber}에서 생성된 프롬프트와 영상입니다.*`;
                                handleInputChange('content', newContent);
                              }}
                              placeholder="프롬프트를 입력하세요..."
                              rows={12}
                            />
                          ) : (
                            <div className="video-preview-wrapper">
                              {videoData?.videoUrl ? (
                                <video 
                                  src={videoData.videoUrl} 
                                  controls
                                  className="generated-video-preview"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <div className="video-placeholder">영상이 없습니다</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 일반 내용 입력 - 편집/미리보기 없이 바로 텍스트 입력 */}
                      <div className="form-section form-section-content">
                        <label className="form-label">내용</label>
                        <div className="content-input-wrapper">
                          <textarea
                            className="form-textarea"
                            value={formData.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            placeholder="프롬프트나 질문 내용을 입력하세요..."
                            rows={12}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 제출 버튼 */}
                <div className="form-submit-section">
                  <button className="submit-btn" onClick={handleSubmit}>
                    게시글 작성
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostWrite;