import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import { searchChallenges } from '../../services/challengeApi.js';
import './ImageCategory.css';

const ImageCategory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('image'); // 'image' or 'video'
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
    
    // 페이지 포커스 시 로그인 상태 재확인
    const handleFocus = () => {
      checkLoginStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // API에서 챌린지 데이터 가져오기
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        
        // /challenges/img/ 엔드포인트에서 직접 이미지 챌린지 데이터 가져오기
        const response = await fetch('http://localhost:8000/challenges/img/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Image challenges API response:', data);
        
        // API 응답 데이터를 컴포넌트에서 사용할 수 있는 형태로 변환
        const transformedData = data.map(challenge => ({
          id: challenge.id,
          title: `Challenge #${challenge.id}\n${challenge.title || '제목 없음'}`,
          description: challenge.content || challenge.description || '설명 없음',
          category: challenge.tag || '이미지',
          difficulty: challenge.level || '중급',
          participants: Math.floor(Math.random() * 1500) + 300, // 임시 참가자 수
          type: 'image'
        }));
        
        setChallenges(transformedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch image challenges:', err);
        setError('이미지 챌린지 데이터를 불러오는데 실패했습니다.');
        
        // 에러 시 빈 배열로 설정
        setChallenges([]);
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
      <Header isLoggedIn={isLoggedIn} />

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

        {/* Body Container */}
        <div className="body-container">
          {/* Search Container */}
          <div className="search-outer-container">
            <div className="search-inner-container">
              {/* Search Box */}
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
                <input
                  type="text"
                  placeholder="문제 제목으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              {/* Filter Frame */}
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

          {/* Challenges Grid Container */}
          {loading ? (
            <div className="loading-container">
              <p>챌린지를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
            </div>
          ) : (
            <div className="challenges-grid">
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