import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import { getCurrentUser } from '../../apis/api.js';
import { convertImagePathToUrl, handleImageError, getImageProps } from '../../utils/imageUrlHelper';
import './ImageProblem.css';

const ImageProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [showOthersImages, setShowOthersImages] = useState(true);
  const [sortBy, setSortBy] = useState('likes');
  const [imageLikes, setImageLikes] = useState(Array.from({ length: 8 }, () => 10));
  const [selectedImage, setSelectedImage] = useState(null);
  const [sharedImages, setSharedImages] = useState([]);
  const [problemData, setProblemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);

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
        const response = await fetch(`${API_BASE_URL}/challenges/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Challenge data:', data);
        console.log('Data structure:', JSON.stringify(data, null, 2));
        console.log('Data ID:', data.id);
        console.log('Data keys:', Object.keys(data));
        
        // 참조 이미지 URL 처리
        let referenceImageUrl = null;
        if (data.img_challenge?.references && data.img_challenge.references.length > 0) {
          const reference = data.img_challenge.references[0];
          if (reference.file_path) {
            referenceImageUrl = convertImagePathToUrl(reference.file_path);
            console.log('Reference image converted:', reference.file_path, '→', referenceImageUrl);
          }
        }

        // API 응답 데이터를 컴포넌트에서 사용할 수 있는 형태로 변환
        const transformedData = {
          title: data.title || '제목 없음',
          category: data.tag === 'img' ? '이미지' : data.tag === 'video' ? '영상' : data.tag === 'ps' ? 'PS' : data.tag || '카테고리 없음',
          difficulty: data.level === 'Easy' ? '초급' : data.level === 'Medium' ? '중급' : data.level === 'Hard' ? '고급' : data.level || '중급',
          referenceImage: referenceImageUrl,
          content: data.content || '문제 내용을 불러올 수 없습니다.'
        };
        
        setProblemData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch challenge data:', err);
        setError('챌린지 데이터를 불러오는데 실패했습니다.');
        
        // 에러 시 기본 데이터 사용
        setProblemData({
          title: `Challenge #${id}\n데이터 로딩 실패`,
          category: '이미지',
          difficulty: '중급',
          content: '서버에서 데이터를 불러올 수 없습니다.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChallengeData();
    }
  }, [id]);

  // 공유된 이미지 목록 가져오기
  useEffect(() => {
    const fetchSharedImages = async () => {
      if (!id) return;
      
      setLoadingImages(true);
      try {
        const apiUrl = `${API_BASE_URL}/shares/img/?challenge_id=${id}`;
        console.log('🖼️ 이미지 공유 데이터 요청 시작');
        console.log('  - Challenge ID:', id);
        console.log('  - API URL:', apiUrl);
        console.log('  - API_BASE_URL:', API_BASE_URL);
        
        const response = await fetch(apiUrl);
        console.log('📡 API 응답 받음:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API 에러 응답:', errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📊 공유 이미지 데이터 수신:', data);
        console.log('📊 데이터 개수:', data.length);
        console.log('📊 첫 번째 공유 구조:', data[0] ? JSON.stringify(data[0], null, 2) : 'No data');
        
        // 모든 공유의 이미지 URL 정보 로깅
        data.forEach((share, index) => {
          console.log(`📊 Share ${index} 원본 데이터:`, {
            id: share.id,
            img_share: share.img_share,
            img_url: share.img_url,
            image_url: share.image_url,
            url: share.url
          });
        });
        
        if (data.length === 0) {
          console.log('No shared images found for this challenge');
          setSharedImages([]);
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

        // API 응답 데이터를 컴포넌트에서 사용할 수 있는 형태로 변환
        const transformedData = data.map((share, index) => {
          console.log(`Processing share ${index}:`, share);
          
          // 이미지 URL을 찾는 로직 개선
          let imageUrl = null;
          let rawImgUrl = null;
          
          // 다양한 필드에서 이미지 URL 찾기
          if (share.img_share?.img_url) {
            rawImgUrl = share.img_share.img_url;
          } else if (share.img_url) {
            rawImgUrl = share.img_url;
          } else if (share.image_url) {
            rawImgUrl = share.image_url;
          } else if (share.url) {
            rawImgUrl = share.url;
          }
          
          if (rawImgUrl) {
            console.log(`Original img_url: ${rawImgUrl}`);
            imageUrl = convertImagePathToUrl(rawImgUrl);
            console.log(`🔄 URL 변환 결과: ${rawImgUrl} → ${imageUrl}`);
          }
          
          console.log(`Share ${index} image URL:`, imageUrl);
          
          // 현재 사용자가 이 공유에 좋아요를 눌렀는지 확인
          const isLiked = currentUserId && share.likes && Array.isArray(share.likes) 
            ? share.likes.some(like => like.user_id === currentUserId)
            : false;
          
          console.log(`Share ${index} isLiked:`, isLiked, 'likes:', share.likes);
          
          return {
            id: share.id || index,
            prompt: share.prompt || '프롬프트를 불러올 수 없습니다.',
            image: imageUrl,
            likes: share.likes || [],
            likes_count: share.likes_count || 0,
            isLiked: isLiked,
            user: share.user || null,
            created_at: share.created_at || new Date().toISOString()
          };
        });
        
        console.log('Transformed shared images:', transformedData);
        setSharedImages(transformedData);
      } catch (err) {
        console.log('💥 이미지 공유 데이터 로딩 실패!');
        console.error('❌ 에러 상세:', err);
        console.log('🔍 에러 분석:');
        console.log('  - 에러 메시지:', err.message);
        console.log('  - 에러 이름:', err.name);
        console.log('  - 에러 스택:', err.stack);
        
        // 네트워크 에러인지 확인
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          console.log('🌐 네트워크 연결 문제로 추정');
          console.log('  - API 서버 상태 확인 필요');
          console.log('  - CORS 설정 확인 필요');
        } else if (err.message.includes('404')) {
          console.log('🔍 404 에러 - API 엔드포인트 확인 필요');
        } else if (err.message.includes('500')) {
          console.log('🔥 500 에러 - 백엔드 서버 오류');
        }
        
        console.log('❌ 이미지 공유 데이터를 불러올 수 없습니다.');
        // 에러 시 빈 배열로 설정
        setSharedImages([]);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchSharedImages();
  }, [id, isGenerated]); // id가 바뀌거나 새로 이미지가 생성되면 다시 불러옴

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      alert('프롬프트를 입력해주세요!');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('이미지를 생성하려면 로그인이 필요합니다.');
      return;
    }
    
    setIsGenerating(true);
    console.log(`🚀 이미지 생성 API 호출: ${API_BASE_URL}/challenges/img/${id}/generate`);
    console.log(`📝 요청 데이터:`, { prompt: promptText, challengeId: id });
    console.log(`🔑 토큰 존재:`, token ? '있음' : '없음');
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/img/${id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (response.status === 401) {
        alert('인증에 실패했습니다. 다시 로그인해주세요.');
        // 선택적으로 로그인 페이지로 리디렉션 할 수 있습니다.
        // window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API 응답 에러 (${response.status}):`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const imageUrl = await response.json();
      console.log('✅ 이미지 생성 성공! 백엔드 응답:', imageUrl);
      console.log('백엔드 응답 타입:', typeof imageUrl);
      console.log('백엔드 응답 상세:', JSON.stringify(imageUrl, null, 2));
      
      // 백엔드에서 받은 경로를 HTTP URL로 변환
      const convertedUrl = convertImagePathToUrl(imageUrl);
      console.log('🔄 URL 변환 결과:', imageUrl, '→', convertedUrl);
      
      setGeneratedImageUrl(convertedUrl);
      setIsGenerated(true);
    } catch (error) {
      console.error('❌ 이미지 생성 실패:', error);
      if (error.message !== 'Unauthorized') {
        if (error.message.includes('500')) {
          alert('서버에서 이미지 생성 중 문제가 발생했습니다.\n\n가능한 원인:\n- AI 이미지 생성 서비스 일시적 오류\n- 프롬프트가 너무 복잡하거나 제한된 내용 포함\n- 서버 과부하\n\n잠시 후 다시 시도해주세요.');
        } else {
          alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setPromptText('');
    setIsGenerated(false);
    // showOthersImages는 항상 true 유지
  };

  const handleNewProblem = () => {
    // 다른 문제로 이동하는 로직
    window.location.href = '/coding/';
  };

  const handleShare = () => {
    console.log('handleShare 호출됨, id:', id, 'type:', typeof id);
    navigate('/board/write', {
      state: {
        problemId: id,
        category: 'image',
        boardCategory: '프롬프트 공유',
        promptText: promptText,
        generatedImageUrl: generatedImageUrl
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
      // 현재 좋아요 상태 확인
      const currentShare = sharedImages.find(img => img.id === shareId);
      const isLiked = currentShare?.isLiked || false;
      const method = isLiked ? 'DELETE' : 'POST';
      
      console.log(`Attempting to ${isLiked ? 'unlike' : 'like'} share ${shareId}`);
      
      const response = await fetch(`${API_BASE_URL}/shares/${shareId}/like`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Like response status:', response.status);

      if (!response.ok) {
        if (response.status === 409) {
          // 이미 좋아요를 누른 경우 (POST 요청 시)
          alert('이미 좋아요를 누른 공유입니다.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 상태 업데이트
      setSharedImages(prevImages => 
        prevImages.map(img => 
          img.id === shareId 
            ? { 
                ...img, 
                isLiked: !isLiked,
                likes_count: isLiked ? Math.max(0, img.likes_count - 1) : img.likes_count + 1
              }
            : img
        )
      );
      
      console.log(`${isLiked ? 'Unliked' : 'Liked'} share ${shareId}`);
    } catch (err) {
      console.error('Error liking/unliking share:', err);
      if (err.message.includes('HTTP error! status: 409')) {
        alert('이미 좋아요를 누른 공유입니다.');
      } else {
        alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleImageClick = (share) => {
    setSelectedImage({
      id: share.id,
      image: share.image || 'https://via.placeholder.com/400x400/CCCCCC/FFFFFF?text=No+Image',
      prompt: share.prompt,
      likes: share.likes_count || 0
    });
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // 정렬 기준에 따라 데이터 정렬하는 함수
  const sortDataByCriteria = (data, criteria) => {
    const sortedData = [...data];
    console.log('Sorting data by:', criteria, 'Data:', sortedData);
    
    switch (criteria) {
      case 'likes':
        const likesSorted = sortedData.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        console.log('Likes sorted:', likesSorted.map(item => ({ id: item.id, likes_count: item.likes_count })));
        return likesSorted;
      case 'random':
        return sortedData.sort(() => Math.random() - 0.5);
      default:
        return sortedData;
    }
  };

  // 정렬 변경 시 데이터 재정렬
  useEffect(() => {
    if (sharedImages.length > 0) {
      const sortedData = sortDataByCriteria(sharedImages, sortBy);
      setSharedImages(sortedData);
    }
  }, [sortBy]);

  // toggleOthersImages 함수 제거 - 항상 표시되므로 불필요

  return (
    <div className="image-problem-page">
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
              {/* Frame 34: 좌측 문제 정보 */}
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
                  {/* 참조 이미지 섹션 */}
                  {problemData.referenceImage && (
                    <div className="problem-section reference-image-section">
                      <div className="section-header">
                        <h3 className="section-title">🖼️ 참조 이미지</h3>
                      </div>
                      <div className="section-content">
                        <div className="reference-image-container">
                          <img 
                            {...getImageProps(problemData.referenceImage)}
                            alt="참조 이미지"
                            className="reference-image"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 마크다운 콘텐츠 렌더링 */}
                  <div className="markdown-content">
                    <ReactMarkdown>{problemData.content}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Frame 50: 우측 상단 프롬프트 입력 영역 */}
              <div className="frame-50">
                <div className="prompt-container">
                  <div className="prompt-editor">
                    <div className="editor-frame">
                      <textarea
                        className="prompt-textarea"
                        placeholder="이곳에 이미지 생성 프롬프트를 작성하세요..."
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
                        <span>{isGenerating ? '생성 중...' : '이미지 생성'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Frame 56: 우측 하단 미리보기 영역 */}
              <div className="frame-56">
                <div className="preview-content">
                  {!isGenerated ? (
                    <div className="preview-message">
                      <p>'이미지 생성' 버튼을 눌러<br />AI가 생성한 이미지를 확인하세요.</p>
                    </div>
                  ) : (
                    <>
                      <div className="generated-result">
                        <div className="generated-image-placeholder">
                          {generatedImageUrl ? (
                            <img 
                              {...getImageProps(generatedImageUrl)}
                              alt="Generated" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onLoad={() => {
                                console.log('✅ Generated image loaded successfully:', generatedImageUrl);
                              }}
                            />
                          ) : (
                            <div className="image-placeholder">생성된 이미지</div>
                          )}
                        </div>
                      </div>
                      {/* 결과 버튼 바 - 피그마 44-2711 */}
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
          
          {/* 하단 안내 문구 */}
          {isGenerated && (
            <div className="result-notice">
              <p>*문제의 프롬포트와 그림은 해당 문제를 푼 도전자에게 모두 공개됩니다.</p>
              <p>*프롬프트 공유하기는 해당 문제를 풀지 않아도, 모든 사람을 대상으로 게시판에 공유하는 것을 말합니다.</p>
            </div>
          )}
        </div>

        {/* 구경하기 섹션 - 기존 레이아웃을 밀어내지 않도록 별도 컨테이너 */}
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
                  {loadingImages ? (
                    <div className="loading-images">
                      <p>이미지를 불러오는 중...</p>
                    </div>
                  ) : sharedImages.length === 0 ? (
                    <div className="no-images">
                      <p>아직 이 문제에 제출된 이미지가 없습니다.</p>
                      <p>첫 번째로 이미지를 제출해보세요!</p>
                    </div>
                  ) : (
                    sharedImages.map((share, i) => (
                      <div key={share.id || i} className="other-image-card">
                        <div 
                          className="other-image-placeholder"
                          onClick={() => handleImageClick(share)}
                          style={{ cursor: 'pointer' }}
                        >
                          {share.image ? (
                            <img 
                              {...getImageProps(share.image)}
                              alt={`Shared submission ${i + 1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : null}
                          <div className="image-placeholder-text" style={{ display: share.image ? 'none' : 'flex' }}>
                            이미지를 불러올 수 없습니다
                          </div>
                        </div>
                        <div className="image-info">
                          <div className="image-prompt">
                            <p>{share.prompt}</p>
                          </div>
                          <div className="image-likes">
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
      
      {/* 이미지 모달 */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={handleCloseModal}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-image-section">
                <div className="modal-image-placeholder">
                  <img {...getImageProps(selectedImage.image)} alt="Selected submission" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>
              <div className="modal-prompt-section">
                <div className="modal-prompt-content">
                  <p className="modal-prompt-text">{selectedImage.prompt}</p>
                </div>
                <div className="modal-likes">
                  <span className="modal-heart">❤️</span>
                  <span className="modal-like-count">{selectedImage.likes}</span>
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

export default ImageProblem;