import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import { getCurrentUser } from '../../apis/api.js';
import './VideoProblem.css';

const VideoProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [showOthersVideos, setShowOthersVideos] = useState(true);
  const [sortBy, setSortBy] = useState('likes');
  const [videoLikes, setVideoLikes] = useState(Array.from({ length: 8 }, () => 10));
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [sharedVideos, setSharedVideos] = useState([]);
  const [problemData, setProblemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);

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
    
    const handleFocus = () => {
      checkLoginStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 백엔드에서 챌린지 데이터 가져오기
  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/challenges/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const transformedData = {
          title: data.title || '제목 없음',
          category: data.tag === 'video' ? '영상' : data.tag || '카테고리 없음',
          difficulty: data.level === 'Easy' ? '초급' : data.level === 'Medium' ? '중급' : data.level === 'Hard' ? '고급' : data.level || '중급',
          sections: [
            {
              title: '📝 상황 설명',
              content: data.content || '문제 상황을 불러올 수 없습니다.'
            },
            {
              title: '🏞️ 장면',
              content: data.content ? data.content.split('.')[0] + '.' : '장면을 불러올 수 없습니다.'
            },
            {
              title: '🎨 스타일 & 주요 요소',
              content: data.content || '스타일과 주요 요소를 불러올 수 없습니다.'
            },
            {
              title: '📜 목표',
              content: '주요 시각 요소와 분위기를 모두 포함한 프롬프트를 작성하세요. 단순 나열이 아닌 자연스럽고 상세한 서술형 프롬프트를 작성할 것.'
            },
            {
              title: '🖍️ 채점방식',
              content: '채점 방식: 커뮤니티 평가 100%'
            }
          ]
        };
        
        setProblemData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch challenge data:', err);
        setError('챌린지 데이터를 불러오는데 실패했습니다.');
        
        setProblemData({
          title: `Challenge #${id}\n데이터 로딩 실패`,
          category: '영상',
          difficulty: '중급',
          sections: [
            {
              title: '📝 상황 설명',
              content: '서버에서 데이터를 불러올 수 없습니다.'
            },
            {
              title: '🏞️ 장면',
              content: '장면을 불러올 수 없습니다.'
            },
            {
              title: '🎨 스타일 & 주요 요소',
              content: '스타일과 주요 요소를 불러올 수 없습니다.'
            },
            {
              title: '📜 목표',
              content: '주요 시각 요소와 분위기를 모두 포함한 프롬프트를 작성하세요.'
            },
            {
              title: '🖍️ 채점방식',
              content: '채점 방식: 커뮤니티 평가 100%'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChallengeData();
    }
  }, [id]);

  // 공유된 비디오 목록 가져오기
  useEffect(() => {
    const fetchSharedVideos = async () => {
      if (!id) return;
      
      setLoadingVideos(true);
      try {
        const response = await fetch(`/api/shares/video/?challenge_id=${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
          setSharedVideos([]);
          return;
        }
        
        // 현재 사용자 ID 가져오기
        let currentUserId = null;
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const userResponse = await fetch(API_ENDPOINTS.USERS_ME, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              currentUserId = userData.id;
              console.log('Current user ID:', currentUserId);
            }
          } catch (err) {
            console.error('Failed to get current user:', err);
          }
        }
        
        const transformedData = data.map((share, index) => {
          let videoUrl = null;
          let rawUrl = share.video_share?.video_url || share.video_url || share.url;

          if (rawUrl) {
            if (rawUrl.startsWith('media/media/')) {
              videoUrl = `/api/media/${rawUrl.substring(12)}`;
            } else {
              videoUrl = `/api/${rawUrl}`;
            }
          }
          
          // 현재 사용자가 이 공유에 좋아요를 눌렀는지 확인
          const isLiked = currentUserId && share.likes && Array.isArray(share.likes) 
            ? share.likes.some(like => like.user_id === currentUserId)
            : false;
          
          console.log(`Video ${index} isLiked:`, isLiked, 'likes:', share.likes);
          
          return {
            id: share.id || index,
            prompt: share.prompt || '프롬프트를 불러올 수 없습니다.',
            video: videoUrl,
            likes: share.likes || [],
            likes_count: share.likes_count || 0,
            isLiked: isLiked,
            user: share.user || null,
            created_at: share.created_at || new Date().toISOString()
          };
        });
        
        setSharedVideos(transformedData);
      } catch (err) {
        console.error('Failed to fetch shared videos:', err);
        setSharedVideos([]);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchSharedVideos();
  }, [id, isGenerated]);

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      alert('프롬프트를 입력해주세요!');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('비디오를 생성하려면 로그인이 필요합니다.');
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/challenges/video/${id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (response.status === 401) {
        alert('인증에 실패했습니다. 다시 로그인해주세요.');
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const videoUrl = await response.json();
      console.log('Raw video URL from backend:', videoUrl);
      
      // media/media/ 중복 제거
      let cleanUrl = videoUrl;
      if (videoUrl.includes('media/media/')) {
        // media/media/shares/... -> media/shares/...
        cleanUrl = videoUrl.replace('media/media/', 'media/');
      }
      
      const fullVideoUrl = `/api/${cleanUrl}`;
      console.log('Final generated video URL:', fullVideoUrl);
      setGeneratedVideoUrl(fullVideoUrl);
      setIsGenerated(true);
    } catch (error) {
      console.error('Failed to generate video:', error);
      if (error.message !== 'Unauthorized') {
        alert('비디오 생성에 실패했습니다.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setPromptText('');
    setIsGenerated(false);
  };

  const handleNewProblem = () => {
    window.location.href = '/video/category';
  };

  const handleShare = () => {
    navigate('/board/write', {
      state: {
        problemId: id,
        category: 'video',
        boardCategory: '프롬프트 공유',
        promptText: promptText,
        generatedVideoUrl: generatedVideoUrl
      }
    });
  };

  const handleLikeClick = async (shareId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }

    try {
      const currentShare = sharedVideos.find(vid => vid.id === shareId);
      const isLiked = currentShare?.isLiked || false;
      const method = isLiked ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/shares/${shareId}/like`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSharedVideos(prevVideos => 
        prevVideos.map(vid => 
          vid.id === shareId 
            ? { 
                ...vid, 
                isLiked: !isLiked,
                likes_count: isLiked ? Math.max(0, vid.likes_count - 1) : vid.likes_count + 1
              }
            : vid
        )
      );
    } catch (err) {
      console.error('Error liking/unliking share:', err);
      alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleVideoClick = (share) => {
    setSelectedVideo({
      id: share.id,
      video: share.video || '',
      prompt: share.prompt
    });
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  const sortDataByCriteria = (data, criteria) => {
    const sortedData = [...data];
    switch (criteria) {
      case 'likes':
        return sortedData.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      case 'random':
        return sortedData.sort(() => Math.random() - 0.5);
      default:
        return sortedData;
    }
  };

  useEffect(() => {
    if (sharedVideos.length > 0) {
      const sortedData = sortDataByCriteria(sharedVideos, sortBy);
      setSharedVideos(sortedData);
    }
  }, [sortBy]);

  return (
    <div className="video-problem-page">
      <Header isLoggedIn={isLoggedIn} />
      <div className="body-section">
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>챌린지 데이터를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
            </div>
          ) : problemData ? (
            <div className="main-layout">
              <div className="frame-34">
                <div className="problem-header">
                  <div className="problem-title-section">
                    <h1 className="problem-title">{problemData.title}</h1>
                  </div>
                  <div className="problem-tags">
                    <div className="tags-row">
                      <div className="tag category-tag">
                        <span>{problemData.category}</span>
                      </div>
                      <div className="tag difficulty-tag">
                        <span>{problemData.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="problem-content">
                  {problemData.sections.map((section, index) => (
                    <div key={index} className="problem-section">
                      <div className="section-header">
                        <h3 className="section-title">{section.title}</h3>
                      </div>
                      <div className="section-content">
                        <p className="section-text">{section.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="frame-50">
                <div className="prompt-container">
                  <div className="prompt-editor">
                    <div className="editor-frame">
                      <textarea
                        className="prompt-textarea"
                        placeholder="이곳에 비디오 생성 프롬프트를 작성하세요..."
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        readOnly={isGenerated}
                      />
                    </div>
                  </div>
                  {!isGenerated && (
                    <div className="action-bar">
                      <button 
                        className="generate-btn"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                      >
                        <span>{isGenerating ? '생성 중...' : '비디오 생성'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="frame-56">
                <div className="preview-content">
                  {!isGenerated ? (
                    <div className="preview-message">
                      <p>'비디오 생성' 버튼을 눌러<br />AI가 생성한 비디오를 확인하세요.</p>
                    </div>
                  ) : (
                    <>
                      <div className="generated-result">
                        <div className="generated-video-placeholder">
                          {generatedVideoUrl ? (
                            <video src={generatedVideoUrl} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
                          ) : (
                            <div className="video-placeholder">생성된 비디오</div>
                          )}
                        </div>
                      </div>
                      <div className="result-action-bar">
                        <button className="result-action-btn" onClick={handleRetry}>
                          <span>다시 풀기</span>
                        </button>
                        <button className="result-action-btn" onClick={handleNewProblem}>
                          <span>다른 문제 풀기</span>
                        </button>
                        <button className="result-action-btn" onClick={handleShare}>
                          <span>프롬프트 공유하기</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          
          {isGenerated && (
            <div className="result-notice">
              <p>*문제의 프롬포트와 영상은 해당 문제를 푼 도전자에게 모두 공개됩니다.</p>
              <p>*프롬프트 공유하기는 해당 문제를 풀지 않아도, 모든 사람을 대상으로 게시판에 공유하는 것을 말합니다.</p>
            </div>
          )}
        </div>

        {isGenerated && (
          <div className="others-section-wrapper">
            <div className="others-section">
              <div className="others-container">
                <div className="others-header">
                  <h2 className="others-title">구경하기</h2>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-btn ${sortBy === 'likes' ? 'active' : ''}`}
                      onClick={() => setSortBy('likes')}
                    >
                      좋아요순
                    </button>
                    <button 
                      className={`filter-btn ${sortBy === 'random' ? 'active' : ''}`}
                      onClick={() => setSortBy('random')}
                    >
                      랜덤순
                    </button>
                  </div>
                </div>
                
                <div className="others-grid">
                  {loadingVideos ? (
                    <div className="loading-videos">
                      <p>비디오를 불러오는 중...</p>
                    </div>
                  ) : sharedVideos.length === 0 ? (
                    <div className="no-videos">
                      <p>아직 이 문제에 제출된 비디오가 없습니다.</p>
                      <p>첫 번째로 비디오를 제출해보세요!</p>
                    </div>
                  ) : (
                    sharedVideos.map((share, i) => (
                      <div key={share.id || i} className="other-video-card">
                        <div 
                          className="other-video-placeholder"
                          onClick={() => handleVideoClick(share)}
                          style={{ cursor: 'pointer' }}
                        >
                          {share.video ? (
                            <video 
                              src={share.video} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="video-placeholder-text" style={{ display: share.video ? 'none' : 'flex' }}>
                            비디오를 불러올 수 없습니다
                          </div>
                        </div>
                        <div className="video-info">
                          <div className="video-prompt">
                            <p>{share.prompt}</p>
                          </div>
                          <div className="video-likes">
                            <span 
                              className={`heart ${share.isLiked ? 'liked' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeClick(share.id);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {share.isLiked ? '❤️' : '🤍'}
                            </span>
                            <span className="like-count">{share.likes_count}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {selectedVideo && (
        <div className="video-modal-overlay" onClick={handleCloseModal}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-video-section">
                <div className="modal-video-placeholder">
                  <video src={selectedVideo.video} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>
              <div className="modal-prompt-section">
                <div className="modal-prompt-content">
                  <p className="modal-prompt-text">{selectedVideo.prompt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default VideoProblem;
