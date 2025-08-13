import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import { getAllChallenges, filterChallengesByCategory, searchChallenges } from '../../services/challengeApi.js';
import './ImageCategory.css';

const ImageCategory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('image'); // 'image' or 'video'
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API에서 챌린지 데이터 가져오기
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const data = await getAllChallenges();
        
        // API에서 받은 데이터를 image 카테고리로 필터링
        const imageChallenges = filterChallengesByCategory(data, 'image');
        setChallenges(imageChallenges);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch challenges:', err);
        setError('챌린지 데이터를 불러오는데 실패했습니다.');
        
        // 에러 시 샘플 데이터 사용
        const sampleChallenges = [
          {
            id: 11,
            title: 'Challenge #11',
            description: '일상 풍경 묘사 프롬프트 만들기',
            category: '이미지',
            difficulty: '초급',
            participants: 856,
            type: 'image'
          },
          {
            id: 12,
            title: 'Challenge #12',
            description: '사실적인 물거품',
            category: '이미지',
            difficulty: '고급',
            participants: 645,
            type: 'image'
          },
          {
            id: 13,
            title: 'Challenge #13',
            description: '뽀송뽀송한 아기 양',
            category: '이미지',
            difficulty: '초급',
            participants: 923,
            type: 'image'
          },
          {
            id: 14,
            title: 'Challenge #14',
            description: '바다 옆 철길을 달리는 사실적인 기차',
            category: '영상',
            difficulty: '초급',
            participants: 778,
            type: 'video'
          },
          {
            id: 15,
            title: 'Challenge #15',
            description: '꿀이 흐르고 보석들이 흩어져있는 핫케이크',
            category: '이미지',
            difficulty: '중급',
            participants: 534,
            type: 'image'
          },
          {
            id: 16,
            title: 'Challenge #16',
            description: '숲속에서 뒤를 돌아보는 흰색 요정 소녀',
            category: '영상',
            difficulty: '고급',
            participants: 412,
            type: 'video'
          }
        ];
        setChallenges(sampleChallenges);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  // 필터링 및 정렬
  const getFilteredAndSortedChallenges = () => {
    let filtered = challenges;

    // 검색어 필터링
    if (searchTerm) {
      filtered = searchChallenges(filtered, searchTerm);
    }

    // 이미지/영상 타입별 정렬
    if (sortBy === 'image') {
      filtered = filtered.filter(challenge => 
        challenge.type === 'image' || 
        challenge.category === '이미지' ||
        (challenge.challenge_type && challenge.challenge_type.includes('image'))
      );
    } else if (sortBy === 'video') {
      filtered = filtered.filter(challenge => 
        challenge.type === 'video' || 
        challenge.category === '영상' ||
        (challenge.challenge_type && challenge.challenge_type.includes('video'))
      );
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
          {loading ? (
            <div className="loading-container">
              <p>챌린지를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <p>임시 데이터로 표시합니다.</p>
            </div>
          ) : (
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
                      <h3 className="challenge-number">
                        {challenge.title.includes('\n') ? challenge.title.split('\n')[0] : challenge.title}
                      </h3>
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
          )}
        </div>

        {!loading && !error && getFilteredAndSortedChallenges().length === 0 && (
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