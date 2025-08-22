import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import FilterButton from '../../components/ui/FilterButton/index.jsx';
import CategoryFilter from '../../components/ui/CategoryFilter/index.jsx';
import './PostWrite.css';

const PostWrite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    title: '',
    boardCategory: '프롬포트 공유', // 질문 또는 프롬포트 공유
    problemCategory: '코딩', // 코딩, 그림, 영상, 탈옥, 문서
    problemNumber: '',
    content: ''
  });

  // useEffect를 사용하여 페이지 이동 시 전달받은 state로 폼 데이터 초기화
  useEffect(() => {
    if (location.state) {
      const { problemId, initialContent, category, boardCategory } = location.state;

      setFormData(prev => ({
        ...prev,
        problemNumber: problemId || prev.problemNumber,
        content: initialContent || prev.content, // 'prompt'를 'initialContent'로 변경
        problemCategory: category === 'coding' ? '코딩' : prev.problemCategory,
        boardCategory: boardCategory || prev.boardCategory,

      }));
    }
  }, [location.state]);

  const [activeTab, setActiveTab] = useState('게시물 작성');
  const [activeCategory, setActiveCategory] = useState('전체');

  const tabs = ['전체', '질문', '프롬포트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상', '탈옥', '문서'];
  const boardCategories = ['질문', '프롬포트 공유'];
  const problemCategories = ['코딩', '그림', '영상', '탈옥', '문서'];

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
    const typeMapping = { '질문': 'question', '프롬포트 공유': 'share' };
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
      '프롬포트 공유': 'share'
    };

    const tagMapping = {
      '코딩': 'ps',
      '그림': 'img',
      '영상': 'video'
      // '탈옥', '문서'는 현재 백엔드 PostTag Enum에 없으므로 제외
    };

    const payload = {
      type: typeMapping[formData.boardCategory],
      tag: tagMapping[formData.problemCategory],
      title: formData.title,
      content: formData.content,
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
                          disabled={!!location.state?.category}
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

                  {/* 내용 */}
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