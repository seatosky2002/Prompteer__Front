import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import { searchChallenges } from '../../services/challengeApi.js';
import { getCurrentUser } from '../../apis/api.js';
import './VideoCategory.css';

const VideoCategory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('video'); // 'image' or 'video'
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [challengeMedia, setChallengeMedia] = useState({});

  // 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        // 실제 API로 토큰 유효성 검증
        const result = await getCurrentUser();

        if (result.success) {
          setIsLoggedIn(true);
        } else {
          // 토큰이 있지만 만료되었거나 무효함 (axios interceptor가 이미 토큰 삭제 처리함)
          setIsLoggedIn(false);
        }
      } catch (error) {
        // API 호출 실패 (네트워크 오류 등)
        console.error("Login status check failed:", error);
        setIsLoggedIn(false);
      }
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
        
        console.log('Fetching video challenges from API...');
        // /challenges/video/ 엔드포인트에서 직접 비디오 챌린지 데이터 가져오기
        const response = await fetch('/api/challenges/video/?limit=50');
        
        console.log('Video challenges response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Video challenges API response:', data);
        console.log('Number of video challenges found:', data.length);
        
        if (data.length === 0) {
          console.warn('No video challenges found in database');
          setError('비디오 챌린지가 없습니다. 먼저 비디오 챌린지를 생성해주세요.');
          setChallenges([]);
          return;
        }
        
        // API 응답 데이터를 컴포넌트에서 사용할 수 있는 형태로 변환
        const transformedData = data.map(challenge => ({
          id: challenge.id,
          title: challenge.title || '제목 없음',
          description: challenge.content || challenge.description || '설명 없음',
          category: challenge.tag || '영상',
          difficulty: getDifficultyText(challenge.level),
          participants: Math.floor(Math.random() * 1500) + 300, // 임시 참가자 수
          type: 'video'
        }));
        
        console.log('Transformed video challenges:', transformedData);
        setChallenges(transformedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch video challenges:', err);
        setError(`비디오 챌린지 데이터를 불러오는데 실패했습니다: ${err.message}`);
        
        // 에러 시 빈 배열로 설정
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  // 각 챌린지의 가장 인기 있는 비디오 가져오기
  useEffect(() => {
    const fetchPopularVideos = async () => {
      if (challenges.length === 0) {
        console.log('No challenges available, skipping video fetch');
        return;
      }

      // 비디오 챌린지만 필터링
      const videoChallenges = challenges.filter(challenge => 
        challenge.type === 'video' || 
        challenge.category === '영상' ||
        (challenge.challenge_type && challenge.challenge_type.includes('video'))
      );

      console.log('Fetching popular videos for challenges:', videoChallenges);
      console.log('Video challenges IDs:', videoChallenges.map(c => c.id));
      
      const mediaMap = {};
      let totalVideosFound = 0;
      
      for (const challenge of videoChallenges) {
        try {
          const videoShareUrl = `/api/shares/video/?challenge_id=${challenge.id}&limit=10`;
          console.log(`Fetching videos from: ${videoShareUrl}`);
          
          const response = await fetch(videoShareUrl);
          console.log(`Fetching videos for challenge ${challenge.id}, response status:`, response.status);
          
          if (response.ok) {
            const shares = await response.json();
            console.log(`Shares for challenge ${challenge.id}:`, shares);
            console.log(`Number of shares found:`, shares.length);
            
            if (shares && shares.length > 0) {
              totalVideosFound += shares.length;
              // 좋아요가 가장 많은 비디오 찾기
              const sortedShares = shares.sort((a, b) => {
                const likesA = (a.likes || []).length;
                const likesB = (b.likes || []).length;
                return likesB - likesA;
              });
              
              const mostLikedShare = sortedShares[0];
              console.log(`Most liked share for challenge ${challenge.id}:`, mostLikedShare);
              
              // video_share 내부의 video_url 확인
              const videoUrl = mostLikedShare.video_share?.video_url || 
                             mostLikedShare.video_url;
              
              console.log(`Raw videoUrl for challenge ${challenge.id}:`, videoUrl);
              console.log(`Full share object:`, mostLikedShare);
              
              if (videoUrl) {
                // API에서 반환된 경로 처리
                let processedUrl = videoUrl;
                
                // 중복된 media/ 제거
                if (processedUrl.startsWith('media/media/')) {
                  processedUrl = processedUrl.substring(6); // 첫 번째 'media/' 제거
                } else if (processedUrl.startsWith('media/')) {
                  processedUrl = processedUrl.substring(6); // 'media/' 제거
                }
                
                const fullVideoUrl = processedUrl.startsWith('http') ? processedUrl : `/api/${processedUrl}`;
                mediaMap[challenge.id] = fullVideoUrl;
                console.log(`Set video for challenge ${challenge.id}:`, fullVideoUrl);
              } else {
                // 좋아요가 없으면 랜덤 선택
                const randomShare = shares[Math.floor(Math.random() * shares.length)];
                const randomVideoUrl = randomShare.video_share?.video_url || 
                                     randomShare.video_url;
                console.log(`Random videoUrl for challenge ${challenge.id}:`, randomVideoUrl);
                
                if (randomVideoUrl) {
                  // API에서 반환된 경로 처리
                  let processedUrl = randomVideoUrl;
                  
                  // 중복된 media/ 제거
                  if (processedUrl.startsWith('media/media/')) {
                    processedUrl = processedUrl.substring(6); // 첫 번째 'media/' 제거
                  } else if (processedUrl.startsWith('media/')) {
                    processedUrl = processedUrl.substring(6); // 'media/' 제거
                  }
                  
                  const fullRandomVideoUrl = processedUrl.startsWith('http') ? processedUrl : `/api/${processedUrl}`;
                  mediaMap[challenge.id] = fullRandomVideoUrl;
                  console.log(`Set random video for challenge ${challenge.id}:`, fullRandomVideoUrl);
                } else {
                  console.log(`No video URL found for challenge ${challenge.id} in random share:`, randomShare);
                }
              }
            } else {
              console.log(`No shares found for challenge ${challenge.id}`);
            }
          } else {
            console.error(`Failed to fetch videos for challenge ${challenge.id}, status:`, response.status);
          }
        } catch (error) {
          console.error(`Failed to fetch videos for challenge ${challenge.id}:`, error);
        }
      }
      
      console.log('=== VIDEO FETCH SUMMARY ===');
      console.log(`Total challenges processed: ${videoChallenges.length}`);
      console.log(`Total videos found: ${totalVideosFound}`);
      console.log(`Videos successfully loaded: ${Object.keys(mediaMap).length}`);
      console.log('Final mediaMap:', mediaMap);
      console.log('=== END SUMMARY ===');
      
      if (Object.keys(mediaMap).length === 0 && videoChallenges.length > 0) {
        console.warn('No videos were loaded for any challenges. This might indicate:');
        console.warn('1. No video shares exist in the database');
        console.warn('2. Video URLs are malformed');
        console.warn('3. API endpoint issues');
      }
      
      setChallengeMedia(mediaMap);
    };

    fetchPopularVideos();
  }, [challenges]);

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
    navigate(`/video/challenge/${challengeId}`);
  };

  // 추천 챌린지 가져오기 (비디오 타입 중 첫 번째)
  const getFeaturedChallenge = () => {
    const videoChallenges = challenges.filter(challenge => 
      challenge.type === 'video' || 
      challenge.category === '영상' ||
      (challenge.challenge_type && challenge.challenge_type.includes('video'))
    );
    return videoChallenges.length > 0 ? videoChallenges[0] : null;
  };

  const handleChallengeNow = () => {
    const featuredChallenge = getFeaturedChallenge();
    if (featuredChallenge) {
      navigate(`/video/challenge/${featuredChallenge.id}`);
    } else {
      navigate('/video/challenge/1');
    }
  };

  return (
    <div className="video-category-page">
      <Header isLoggedIn={isLoggedIn} />

      {/* Main Content */}
      <main className="video-main">
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
                      <p className="challenge-name">{featuredChallenge.title || '영상 챌린지'}</p>
                    </>
                  ) : (
                    <>
                      <h3 className="challenge-number">Challenge #1</h3>
                      <p className="challenge-name">영상 챌린지</p>
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
          <div className="video-category-search-outer-container">
            {/* Search Inner - Figma: 검색창 내부 */}
            <div className="video-category-search-inner-container">
              {/* Search Box - Figma: 검색창 */}
              <div className="video-category-search-box">
                <svg
                  className="video-category-search-icon"
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
                  className="video-category-search-input"
                />
              </div>
              {/* Filter Frame - Figma: Frame 106 */}
              <div className="filter-frame">
                <button
                  className={`filter-btn ${sortBy === 'image' ? 'active' : ''}`}
                  onClick={() => navigate('/category/image')}
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
                  className="video-component"
                  onClick={() => handleChallengeClick(challenge.id)}
                >
                  {/* Frame 17 - Main Card with Background Image */}
                  <div className="frame-17">
                    {/* Video Content */}
                    {challengeMedia[challenge.id] ? (
                      <video 
                        className="challenge-video"
                        src={challengeMedia[challenge.id]}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onMouseEnter={(e) => {
                          console.log('Video hover play:', e.target.src);
                          e.target.play().catch(err => console.log('Play failed:', err));
                        }}
                        onMouseLeave={(e) => {
                          e.target.pause();
                        }}
                        onError={(e) => {
                          console.error('Video load error:', e.target.src, e);
                          e.target.style.display = 'none';
                        }}
                        onLoadStart={() => {
                          console.log('Video load started:', challengeMedia[challenge.id]);
                        }}
                        onCanPlay={() => {
                          console.log('Video can play:', challengeMedia[challenge.id]);
                        }}
                      />
                    ) : (
                      <div className="video-placeholder">
                        <div className="video-placeholder-content">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5V19L19 12L8 5Z" fill="#6C757D"/>
                          </svg>
                          <p>비디오 로딩 중...</p>
                        </div>
                      </div>
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

export default VideoCategory;