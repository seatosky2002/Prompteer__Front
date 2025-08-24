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
  const [challengeMedia, setChallengeMedia] = useState({});

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

  // 난이도 텍스트 변환 함수
  const getDifficultyText = (level) => {
    if (!level) return "중급"; // 기본값

    const levelLower = level.toLowerCase();
    switch (levelLower) {
      case "easy":
        return "초급";
      case "medium":
        return "중급";
      case "hard":
        return "고급";
      default:
        return "중급"; // 기본값
    }
  };

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
          title: challenge.title || '제목 없음',
          description: challenge.content || challenge.description || '설명 없음',
          category: challenge.tag || '이미지',
          difficulty: getDifficultyText(challenge.level),
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

  // 각 챌린지의 가장 인기 있는 이미지 가져오기
  useEffect(() => {
    const fetchPopularImages = async () => {
      if (challenges.length === 0) return;

      // 이미지 챌린지만 필터링
      const imageChallenges = challenges.filter(challenge => 
        challenge.type === 'image' || 
        challenge.type === 'img' ||
        challenge.category === '이미지' ||
        challenge.category === '그림' ||
        (challenge.challenge_type && (challenge.challenge_type.includes('image') || challenge.challenge_type.includes('img')))
      );

      // console.log('Fetching popular images for challenges:', imageChallenges);
      // console.log('Image challenges IDs:', imageChallenges.map(c => c.id));
      const mediaMap = {};
      
      for (const challenge of imageChallenges) {
        try {
          const response = await fetch(`http://localhost:8000/shares/img/?challenge_id=${challenge.id}&limit=10`);
          // console.log(`Fetching images for challenge ${challenge.id}, response status:`, response.status);
          
          if (response.ok) {
            const shares = await response.json();
            // console.log(`Shares for challenge ${challenge.id}:`, shares);
            // console.log(`First share details:`, shares[0]);
            
            if (shares && shares.length > 0) {
              // 좋아요가 가장 많은 이미지 찾기
              const sortedShares = shares.sort((a, b) => {
                const likesA = (a.likes || []).length;
                const likesB = (b.likes || []).length;
                return likesB - likesA;
              });
              
              const mostLikedShare = sortedShares[0];
              // console.log(`Most liked share for challenge ${challenge.id}:`, mostLikedShare);
              // console.log(`Available fields in share:`, Object.keys(mostLikedShare));
              // console.log(`img_share object:`, mostLikedShare.img_share);
              
              // img_share 내부의 img_url 확인
              const imageUrl = mostLikedShare.img_share?.img_url || 
                             mostLikedShare.img_url || 
                             mostLikedShare.image || 
                             mostLikedShare.img;
              
              // console.log(`Raw imageUrl from API:`, imageUrl);
              
              if (imageUrl) {
                // API에서 반환된 경로에서 첫 번째 'media/' 제거
                let processedUrl = imageUrl;
                if (processedUrl.startsWith('media/')) {
                  processedUrl = processedUrl.substring(6); // 'media/' 제거
                }
                
                const fullImageUrl = processedUrl.startsWith('http') ? processedUrl : `http://localhost:8000/${processedUrl}`;
                mediaMap[challenge.id] = fullImageUrl;
                // console.log(`Set image for challenge ${challenge.id}:`, fullImageUrl);
              } else {
                // 좋아요가 없으면 랜덤 선택
                const randomShare = shares[Math.floor(Math.random() * shares.length)];
                const randomImageUrl = randomShare.img_share?.img_url || 
                                     randomShare.img_url || 
                                     randomShare.image || 
                                     randomShare.img;
                if (randomImageUrl) {
                  // API에서 반환된 경로에서 첫 번째 'media/' 제거
                  let processedUrl = randomImageUrl;
                  if (processedUrl.startsWith('media/')) {
                    processedUrl = processedUrl.substring(6); // 'media/' 제거
                  }
                  
                  const fullRandomImageUrl = processedUrl.startsWith('http') ? processedUrl : `http://localhost:8000/${processedUrl}`;
                  mediaMap[challenge.id] = fullRandomImageUrl;
                  // console.log(`Set random image for challenge ${challenge.id}:`, fullRandomImageUrl);
                } else {
                  // console.log(`No image URL found for challenge ${challenge.id} in share:`, randomShare);
                }
              }
            } else {
              // console.log(`No shares found for challenge ${challenge.id}`);
            }
          }
        } catch (error) {
          console.error(`Failed to fetch images for challenge ${challenge.id}:`, error);
        }
      }
      
      // console.log('Final mediaMap:', mediaMap);
      setChallengeMedia(mediaMap);
    };

    fetchPopularImages();
  }, [challenges]);

  // challengeMedia가 업데이트될 때 로그
  // useEffect(() => {
  //   console.log('challengeMedia updated:', challengeMedia);
  // }, [challengeMedia]);

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
        challenge.type === 'img' ||
        challenge.category === '이미지' ||
        challenge.category === '그림' ||
        (challenge.challenge_type && (challenge.challenge_type.includes('image') || challenge.challenge_type.includes('img')))
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

  // 추천 챌린지 가져오기 (이미지 타입 중 첫 번째)
  const getFeaturedChallenge = () => {
    const imageChallenges = challenges.filter(challenge => 
      challenge.type === 'image' || 
      challenge.category === '이미지' ||
      (challenge.challenge_type && challenge.challenge_type.includes('image'))
    );
    return imageChallenges.length > 0 ? imageChallenges[0] : null;
  };

  const handleChallengeNow = () => {
    const featuredChallenge = getFeaturedChallenge();
    if (featuredChallenge) {
      navigate(`/image/challenge/${featuredChallenge.id}`);
    } else {
      navigate('/image/challenge/1');
    }
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
              <div className="status-badge">추천</div>
              <div className="featured-info">
                {(() => {
                  const featuredChallenge = getFeaturedChallenge();
                  return featuredChallenge ? (
                    <>
                      <h3 className="challenge-number">Challenge #{featuredChallenge.id}</h3>
                      <p className="challenge-name">{featuredChallenge.title || '이미지 챌린지'}</p>
                    </>
                  ) : (
                    <>
                      <h3 className="challenge-number">Challenge #1</h3>
                      <p className="challenge-name">이미지 챌린지</p>
                    </>
                  );
                })()}
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
          <div className="image-category-search-outer-container">
            {/* Search Inner - Figma: 검색창 내부 */}
            <div className="image-category-search-inner-container">
              {/* Search Box - Figma: 검색창 */}
              <div className="image-category-search-box">
                <svg
                  className="image-category-search-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 1 8 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                    stroke="#CED4DA"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="문제 제목으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="image-category-search-input"
                />
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
                  onClick={() => navigate('/category/video')}
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
                    {/* Image Content */}
                    {challengeMedia[challenge.id] && (
                      <img 
                        className="challenge-image"
                        src={challengeMedia[challenge.id]}
                        alt={`Challenge ${challenge.id}`}
                        onError={(e) => {
                          // console.error(`Image load error for challenge ${challenge.id}:`, e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    {/* Frame 21 - Category Badge (Top Right) */}
                    <div className="frame-21">
                      <span className="category-text">{challenge.category}</span>
                    </div>
                  </div>
                  
                  {/* Frame 108 - Bottom Text Section */}
                  <div className="frame-108">
                    {/* Frame 107 - Text Content */}
                    <div className="frame-107">
                      <div className="challenge-id">Challenge #{challenge.id}</div>
                      <h3 className="challenge-title">
                        {challenge.title || '제목 없음'}
                      </h3>
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