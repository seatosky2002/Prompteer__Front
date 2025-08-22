import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import { getAllChallenges, filterChallengesByCategory, searchChallenges } from '../../services/challengeApi.js';
import './CodingCategory.css';

const CodingCategory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('difficulty'); // 'difficulty' or 'latest'
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
        
        // 직접 API 호출
        const response = await fetch('http://localhost:8000/challenges/ps/');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        // 데이터 변환
        const transformedData = data.map(challenge => ({
          id: challenge.id,
          title: `Challenge #${challenge.id}\n${challenge.title || '제목 없음'}`,

          description: challenge.content || challenge.problemDescription?.situation || challenge.description || '설명 없음',
          challenge_type: 'CODE',
          type: 'code',
          difficulty: challenge.difficulty || '중급',
          category: '코딩',
          participants: Math.floor(Math.random() * 1500) + 300,
          createdAt: challenge.created_at,
          creator_id: challenge.creator_id
        }));
        
        setChallenges(transformedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch challenges:', err);
        setError('챌린지 데이터를 불러오는데 실패했습니다.');
        
        // 에러 시 빈 배열로 설정 (로딩 상태는 false로 유지)
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

    // 정렬
    if (sortBy === 'difficulty') {
      const difficultyOrder = { '초급': 1, '중급': 2, '고급': 3 };
      filtered.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
    } else if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  };

  const handleChallengeClick = (challengeId) => {
    navigate(`/coding/problem/${challengeId}`);
  };

  const handleChallengeNow = () => {
    // Featured 챌린지 #12로 이동
    navigate('/coding/problem/12');
  };

  return (
    <div className="coding-category-page">
      <Header isLoggedIn={isLoggedIn} />

      {/* Main Content */}
      <main className="coding-main">
        {/* Featured Section */}
        <div className="featured-section">
          <div className="featured-content">
            <h2 className="featured-title">코딩 카테고리</h2>
            <div className="featured-details">
              <div className="status-badge">doing</div>
              <div className="featured-info">
                <h3 className="challenge-number">Challenge #12</h3>
                <p className="challenge-name">BFS 알골리즘</p>
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
                  className={`filter-btn ${sortBy === 'difficulty' ? 'active' : ''}`}
                  onClick={() => setSortBy('difficulty')}
                >
                  난이도순
                </button>
                <button
                  className={`filter-btn ${sortBy === 'latest' ? 'active' : ''}`}
                  onClick={() => setSortBy('latest')}
                >
                  최신순
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
                  className="challenge-card"
                  onClick={() => handleChallengeClick(challenge.id)}
                >
                {/* Frame 127 */}
                <div className="frame-127">
                  {/* Frame 22 */}
                  <div className="frame-22">
                    <h3 className="challenge-title">
                      {challenge.title}
                    </h3>
                  </div>
                  {/* Frame 21 - Category Badge */}
                  <div className="frame-21">
                    <span className="category-text">{challenge.category}</span>
                  </div>
                </div>
                
                {/* Frame 23 - Description */}
                <div className="frame-23">
                  <div className="frame-24">
                    <p className="challenge-description-text">{challenge.description}</p>
                  </div>
                </div>
                
                {/* Frame 25 - Difficulty */}
                <div className="frame-25">
                  <div className="frame-26">
                    <div className={`frame-28 difficulty-${challenge.difficulty}`}>
                      <span className="difficulty-text">{challenge.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                {/* Frame 29 - Participants */}
                <div className="frame-29">
                  <div className="frame-33">
                    <span className="participants-text">🧑 {challenge.participants}명 참가 중</span>
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

export default CodingCategory;