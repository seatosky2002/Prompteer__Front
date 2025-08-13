import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import './ImageCategory.css';

const ImageCategory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('image'); // 'image' or 'video'

  // 샘플 이미지/영상 챌린지 데이터 (9개로 수정)
  const challenges = [
    {
      id: 11,
      title: 'Challenge #11\n일상 풍경 묘사 프롬프트 만들기',
      description: '일상 풍경 묘사 프롬프트 만들기',
      category: '이미지',
      difficulty: '초급',
      participants: 856,
      createdAt: '2025-01-01'
    },
    {
      id: 12,
      title: 'Challenge #12\n사실적인 물거품',
      description: '사실적인 물거품',
      category: '이미지',
      difficulty: '고급',
      participants: 645,
      createdAt: '2025-01-02'
    },
    {
      id: 13,
      title: 'Challenge #13\n뽀송뽀송한 아기 양',
      description: '뽀송뽀송한 아기 양',
      category: '이미지',
      difficulty: '초급',
      participants: 923,
      createdAt: '2025-01-03'
    },
    {
      id: 14,
      title: 'Challenge #14\n바다 옆 철길을 달리는 사실적인 기차',
      description: '바다 옆 철길을 달리는 사실적인 기차',
      category: '영상',
      difficulty: '초급',
      participants: 778,
      createdAt: '2025-01-04'
    },
    {
      id: 15,
      title: 'Challenge #15\n꿀이 흐르고 보석들이 흩어져있는 핫케이크',
      description: '꿀이 흐르고 보석들이 흩어져있는 핫케이크',
      category: '이미지',
      difficulty: '중급',
      participants: 534,
      createdAt: '2025-01-05'
    },
    {
      id: 16,
      title: 'Challenge #16\n숲속에서 뒤를 돌아보는 흰색 요정 소녀',
      description: '숲속에서 뒤를 돌아보는 흰색 요정 소녀',
      category: '영상',
      difficulty: '고급',
      participants: 412,
      createdAt: '2025-01-06'
    },
    {
      id: 17,
      title: 'Challenge #17\n겨울 풍경의 따뜻한 오두막',
      description: '겨울 풍경의 따뜻한 오두막',
      category: '이미지',
      difficulty: '중급',
      participants: 689,
      createdAt: '2025-01-07'
    },
    {
      id: 18,
      title: 'Challenge #18\n우주에서 춤추는 은하계',
      description: '우주에서 춤추는 은하계',
      category: '영상',
      difficulty: '고급',
      participants: 345,
      createdAt: '2025-01-08'
    },
    {
      id: 19,
      title: 'Challenge #19\n신비로운 마법의 숲',
      description: '신비로운 마법의 숲',
      category: '이미지',
      difficulty: '초급',
      participants: 1034,
      createdAt: '2025-01-09'
    }
  ];

  // 필터링 및 정렬
  const getFilteredAndSortedChallenges = () => {
    let filtered = challenges;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    if (sortBy === 'image') {
      filtered = filtered.filter(challenge => challenge.category === '이미지');
    } else if (sortBy === 'video') {
      filtered = filtered.filter(challenge => challenge.category === '영상');
    }

    return filtered;
  };

  const handleChallengeClick = (challengeId) => {
    navigate(`/image/challenge/${challengeId}`);
  };

  const handleChallengeNow = () => {
    // Featured 챌린지 #11로 이동
    navigate('/image/challenge/11');
  };

  return (
    <div className="image-category-page">
      <Header />

      {/* Main Content */}
      <main className="image-main">
        {/* Featured Section */}
        <div className="featured-section">
          <div className="featured-content">
            <h2 className="featured-title">그림 / 영상 카테고리</h2>
            <div className="featured-details">
              <div className="status-badge">doing</div>
              <div className="featured-info">
                <h3 className="challenge-number">Challenge #11</h3>
                <p className="challenge-name">일상 풍경 묘사 프롬프트 만들기</p>
              </div>
              <button className="challenge-now-btn" onClick={handleChallengeNow}>
                지금 도전하기 →
              </button>
            </div>
          </div>
        </div>

        {/* Body Container - Figma: body_container */}
        <div className="body-container">
          {/* Search Container - Figma: 검색창 외부 */}
          <div className="search-outer-container">
            {/* Search Inner - Figma: 검색창 내부 */}
            <div className="search-inner-container">
              {/* Search Box - Figma: 검색창 */}
              <div className="search-box">
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
              {/* Filter Frame - Figma: Frame 106 */}
              <div className="filter-frame">
                <button
                  className={`filter-btn ${sortBy === 'image' ? 'active' : ''}`}
                  onClick={() => setSortBy('image')}
                >
                  이미지
                </button>
                <button
                  className={`filter-btn ${sortBy === 'video' ? 'active' : ''}`}
                  onClick={() => setSortBy('video')}
                >
                  영상
                </button>
              </div>
            </div>
          </div>

          {/* Challenges Grid Container - Figma: Frame 283 */}
          <div className="frame-283">
            {getFilteredAndSortedChallenges().map((challenge) => (
              <div
                key={challenge.id}
                className="image-component"
                onClick={() => handleChallengeClick(challenge.id)}
              >
                {/* Frame 17 - Main Card with Background Image */}
                <div className="frame-17">
                  {/* Frame 21 - Category Badge (Top Right) */}
                  <div className="frame-21">
                    <span className="category-text">{challenge.category}</span>
                  </div>
                </div>
                
                {/* Frame 108 - Bottom Text Section */}
                <div className="frame-108">
                  {/* Frame 107 - Text Content */}
                  <div className="frame-107">
                    <h3 className="challenge-number">{challenge.title.split('\n')[0]}</h3>
                    <p className="challenge-description">{challenge.description}</p>
                  </div>
                  
                  {/* Frame 27 - Difficulty Badge */}
                  <div className={`frame-27 difficulty-${challenge.difficulty}`}>
                    <span className="difficulty-text">{challenge.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {getFilteredAndSortedChallenges().length === 0 && (
          <div className="no-results">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ImageCategory;