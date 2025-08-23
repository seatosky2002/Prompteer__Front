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
  const [imageData, setImageData] = useState(null);
  const [activeTab, setActiveTab] = useState('게시물 작성');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [contentViewMode, setContentViewMode] = useState('edit'); // 'edit' or 'preview'
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    title: '',
    boardCategory: '프롬프트 공유', // 질문 또는 프롬프트 공유
    problemCategory: '코딩', // 코딩, 그림, 영상, 탈옥, 문서
    problemNumber: '',
    content: ''
  });

  // useEffect를 사용하여 페이지 이동 시 전달받은 state로 폼 데이터 초기화
  useEffect(() => {
    console.log('PostWrite useEffect - location.state:', location.state);
    if (location.state) {
      const { problemId, initialContent, category, boardCategory, promptText, generatedImageUrl } = location.state;
      console.log('PostWrite - 받은 데이터:', { problemId, initialContent, category, boardCategory, promptText, generatedImageUrl });

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
        } else {
        // 일반적인 경우
        setFormData(prev => ({
          ...prev,
          problemNumber: problemId || prev.problemNumber,
          content: initialContent || prev.content,
          problemCategory: category === 'coding' ? '코딩' : category === 'image' ? '그림' : prev.problemCategory,
          boardCategory: boardCategory || prev.boardCategory,
        }));
      }
    }
  }, [location.state]);

  // formData 변경 시 로그 출력
  useEffect(() => {
    console.log('formData 변경됨:', formData);
    console.log('isImageChallenge:', isImageChallenge);
  }, [formData, isImageChallenge]);

  const tabs = ['전체', '질문', '프롬프트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상'];
  const boardCategories = ['질문', '프롬프트 공유'];
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
                          className={`category-btn ${formData.boardCategory === category ? 'active' : ''}`}
                          onClick={() => handleCategorySelect('boardCategory', category)}
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
                      {problemCategories.map((category) => (
                        <button
                          key={category}
                          className={`category-btn ${formData.problemCategory === category ? 'active' : ''}`}
                          onClick={() => handleCategorySelect('problemCategory', category)}
                        >
                          {category}
                        </button>
                      ))}
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

                  {/* 프롬프트와 이미지 버튼 (이미지 챌린지에서 온 경우만) */}
                  {isImageChallenge && (
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
                          이미지
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