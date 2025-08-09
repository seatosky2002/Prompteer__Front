import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import ImageCard from '../../components/cards/ImageCard/index.jsx';
import './ImageCategory.css';

const ImageCategory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'image', 'video'

  // 샘플 이미지/영상 챌린지 데이터
  const challenges = [
    {
      id: 11,
      title: 'Challenge #11',
      description: '일상 풍경 묘사 프롬프트 만들기',
      category: '이미지',
      difficulty: '초급',
      type: 'image',
      createdAt: '2025-01-01'
    },
    {
      id: 12,
      title: 'Challenge #12',
      description: '사실적인 물거품',
      category: '이미지',
      difficulty: '고급',
      type: 'image',
      createdAt: '2025-01-02'
    },
    {
      id: 13,
      title: 'Challenge #13',
      description: '뽀송뽀송한 아기 양',
      category: '이미지',
      difficulty: '초급',
      type: 'image',
      createdAt: '2025-01-03'
    },
    {
      id: 14,
      title: 'Challenge #14',
      description: '바다 옆 철길을 달리는 사실적인 기차',
      category: '영상',
      difficulty: '초급',
      type: 'video',
      createdAt: '2025-01-04'
    },
    {
      id: 15,
      title: 'Challenge #15',
      description: '꿀이 흐르고 보석들이 흩어져있는 핫케이크',
      category: '이미지',
      difficulty: '중급',
      type: 'image',
      createdAt: '2025-01-05'
    },
    {
      id: 16,
      title: 'Challenge #16',
      description: '숲속에서 뒤를 돌아보는 흰색 요정 소녀',
      category: '영상',
      difficulty: '고급',
      type: 'video',
      createdAt: '2025-01-06'
    }
  ];

  // 필터링된 챌린지 가져오기
  const getFilteredChallenges = () => {
    let filtered = challenges;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 카테고리 필터링
    if (activeFilter !== 'all') {
      filtered = filtered.filter(challenge => challenge.type === activeFilter);
    }

    return filtered;
  };

  const handleChallengeClick = (challengeId) => {
    // 이미지/영상 챌린지 상세 페이지로 이동 (구현 예정)
    navigate(`/image/challenge/${challengeId}`);
  };

  const handleFeaturedChallenge = () => {
    // Featured 챌린지로 이동
    navigate('/image/challenge/11');
  };

  return (
    <div className="image-category-page">
      <Header />
      <main className="image-category-main">
        <div className="image-category-container">
          {/* 페이지 헤더 */}
          <div className="page-header">
            <div className="page-title-section">
              <h1 className="page-title">이미지/영상 챌린지</h1>
            </div>
          </div>

          {/* Featured 챌린지 섹션 */}
          <div className="featured-section">
            <div className="featured-challenge">
              <div className="featured-content">
                <h1 className="featured-title">그림 / 영상 카테고리</h1>
                <div className="featured-details">
                  <div className="featured-status">
                    <span className="status-badge">doing</span>
                  </div>
                  <div className="featured-info">
                    <h2 className="featured-challenge-title">Challenge #11</h2>
                    <p className="featured-challenge-subtitle">일상 풍경 묘사 프롬프트 만들기</p>
                  </div>
                  <button className="challenge-now-btn" onClick={handleFeaturedChallenge}>
                    지금 도전하기 →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터 섹션 */}
          <div className="search-filter-section">
            <div className="search-container">
              <div className="search-box">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="챌린지 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <div className="search-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                        stroke="#CED4DA"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${activeFilter === 'image' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('image')}
                  >
                    이미지
                  </button>
                  <button
                    className={`filter-btn ${activeFilter === 'video' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('video')}
                  >
                    영상
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 챌린지 그리드 */}
          <div className="challenges-grid">
            {getFilteredChallenges().map((challenge) => (
              <ImageCard
                key={challenge.id}
                challengeId={challenge.id}
                title={challenge.title}
                description={challenge.description}
                category={challenge.category}
                difficulty={challenge.difficulty}
                type={challenge.type}
                onClick={() => handleChallengeClick(challenge.id)}
              />
            ))}
          </div>

          {getFilteredChallenges().length === 0 && (
            <div className="no-results">
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImageCategory;