import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import { getCurrentUser } from '../../apis/api.js';
import { convertImagePathToUrl, getImageProps } from '../../utils/imageUrlHelper';
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
        console.log(`🚀 비디오 챌린지 API 호출: ${API_BASE_URL}/challenges/${id}`);
        const response = await fetch(`${API_BASE_URL}/challenges/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ 비디오 챌린지 데이터 로드 성공:', data);
        
        // 참조 비디오 URL 처리
        let referenceVideoUrl = null;
        if (data.video_challenge?.references && data.video_challenge.references.length > 0) {
          const reference = data.video_challenge.references[0];
          if (reference.file_path) {
            referenceVideoUrl = convertImagePathToUrl(reference.file_path);
            console.log('Reference video converted:', reference.file_path, '→', referenceVideoUrl);
          }
        }
        
        const transformedData = {
          title: data.title || '제목 없음',
          category: data.tag === 'video' ? '영상' : data.tag || '카테고리 없음',
          difficulty: data.level === 'Easy' ? '초급' : data.level === 'Medium' ? '중급' : data.level === 'Hard' ? '고급' : data.level || '중급',
          referenceVideo: referenceVideoUrl,
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
        console.error('❌ 비디오 챌린지 데이터 로딩 실패:', err);
        setError('챌린지 데이터를 불러오는데 실패했습니다.');
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
        const response = await fetch(`${API_BASE_URL}/shares/video/?challenge_id=${id}`);
        
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
            videoUrl = convertImagePathToUrl(rawUrl);
            console.log(`Video ${index} URL converted:`, rawUrl, '→', videoUrl);
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
    console.log('🎬 비디오 생성 시작');
    console.log('🔧 현재 설정:');
    console.log('  - Challenge ID:', id);
    console.log('  - API_BASE_URL:', API_BASE_URL);
    console.log('  - 프롬프트 길이:', promptText.length);
    console.log('  - 프롬프트 내용:', promptText);
    
    if (!promptText.trim()) {
      console.log('❌ 프롬프트가 비어있음');
      alert('프롬프트를 입력해주세요!');
      return;
    }

    const token = localStorage.getItem('access_token');
    console.log('🔐 토큰 확인:');
    console.log('  - 토큰 존재:', !!token);
    console.log('  - 토큰 길이:', token ? token.length : 0);
    console.log('  - 토큰 앞 10자:', token ? token.substring(0, 10) + '...' : 'null');
    
    if (!token) {
      console.log('❌ 토큰이 없음 - 로그인 필요');
      alert('비디오를 생성하려면 로그인이 필요합니다.');
      return;
    }
    
    setIsGenerating(true);
    try {
      const apiUrl = `${API_BASE_URL}/challenges/video/${id}/generate`;
      console.log(`🚀 비디오 생성 API 호출: ${apiUrl}`);
      console.log('📝 요청 데이터:');
      console.log('  - URL:', apiUrl);
      console.log('  - Method: POST');
      console.log('  - Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 10)}...`
      });
      console.log('  - Body:', JSON.stringify({ prompt: promptText }));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      console.log('📡 응답 받음:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 401) {
        console.log('❌ 401 인증 실패');
        alert('인증에 실패했습니다. 다시 로그인해주세요.');
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        console.log(`❌ HTTP 에러 발생: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`❌ API 응답 에러 (${response.status}):`, errorText);
        console.log('🔍 전체 에러 응답:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      console.log('✅ 성공적으로 응답 받음');
      const videoUrl = await response.json();
      console.log('📹 백엔드에서 받은 비디오 URL:', videoUrl);
      console.log('📹 URL 타입:', typeof videoUrl);
      console.log('📹 URL 내용 상세:', videoUrl);
      
      // URL 처리 - 유틸리티 함수 사용
      console.log('🔧 URL 처리 시작:');
      console.log('  - 원본 URL:', videoUrl);
      
      const fullVideoUrl = convertImagePathToUrl(videoUrl);
      console.log('✅ 최종 생성된 비디오 URL:', fullVideoUrl);
      console.log('🎯 비디오 상태 업데이트 중...');
      
      setGeneratedVideoUrl(fullVideoUrl);
      setIsGenerated(true);
      
      console.log('✅ 비디오 생성 완료!');
    } catch (error) {
      console.log('💥 에러 발생!');
      console.error('❌ 비디오 생성 실패:', error);
      console.log('🔍 에러 상세 정보:');
      console.log('  - 에러 메시지:', error.message);
      console.log('  - 에러 이름:', error.name);
      console.log('  - 에러 스택:', error.stack);
      console.log('  - 에러 전체 객체:', error);
      
      if (error.message !== 'Unauthorized') {
        console.log('🚨 사용자에게 에러 알림 표시');
        if (error.message.includes('500')) {
          console.log('  - 500 서버 에러로 판단');
          
          // Gemini API 관련 에러 체크
          if (error.message.includes('enhancePrompt') || error.message.includes('INVALID_ARGUMENT')) {
            console.log('  - Gemini API 설정 문제로 판단');
            alert('AI 비디오 생성 서비스 설정에 문제가 있습니다.\n\n이는 백엔드 서버의 AI 모델 설정 문제로,\n개발팀에서 수정 중입니다.\n\n잠시 후 다시 시도해주세요.');
          } else {
            alert('서버에서 비디오 생성 중 문제가 발생했습니다.\n\n가능한 원인:\n- AI 비디오 생성 서비스 일시적 오류\n- 프롬프트가 너무 복잡하거나 제한된 내용 포함\n- 서버 과부하\n\n잠시 후 다시 시도해주세요.');
          }
        } else {
          console.log('  - 일반 에러로 판단');
          alert('비디오 생성에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        console.log('  - 인증 에러로 판단, 알림 표시 안함');
      }
    } finally {
      console.log('🔄 비디오 생성 상태 리셋');
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
      
      const response = await fetch(`${API_BASE_URL}/shares/${shareId}/like`, {
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
                  {/* 참조 비디오 섹션 */}
                  {problemData.referenceVideo && (
                    <div className="problem-section reference-video-section">
                      <div className="section-header">
                        <h3 className="section-title">🎬 참조 비디오</h3>
                      </div>
                      <div className="section-content">
                        <div className="reference-video-container">
                          <video 
                            {...getImageProps(problemData.referenceVideo)}
                            controls
                            className="reference-video"
                            preload="metadata"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                            <video 
                              {...getImageProps(generatedVideoUrl)} 
                              controls 
                              style={{ maxWidth: '100%', maxHeight: '100%' }} 
                            />
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
                              {...getImageProps(share.video)}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                  <video 
                    {...getImageProps(selectedVideo.video)} 
                    controls 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
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
