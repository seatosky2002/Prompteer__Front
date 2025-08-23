import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
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
    const checkLoginStatus = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
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
        const response = await fetch(`http://localhost:3000/challenges/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Challenge data:', data);
        console.log('Data structure:', JSON.stringify(data, null, 2));
        console.log('Data ID:', data.id);
        console.log('Data keys:', Object.keys(data));
        
        // API 응답 데이터를 컴포넌트에서 사용할 수 있는 형태로 변환
        const transformedData = {
          title: data.title || '제목 없음',
          category: data.tag === 'img' ? '이미지' : data.tag === 'video' ? '영상' : data.tag === 'ps' ? 'PS' : data.tag || '카테고리 없음',
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
        
        // 에러 시 기본 데이터 사용
        setProblemData({
          title: `Challenge #${id}\n데이터 로딩 실패`,
          category: '이미지',
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

  // 공유된 이미지 목록 가져오기
  useEffect(() => {
    const fetchSharedImages = async () => {
      if (!id) return;
      
      setLoadingImages(true);
      try {
        console.log('Fetching shared images for challenge:', id);
        const response = await fetch(`http://localhost:8000/shares/img/?challenge_id=${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Shared images data:', data);
        console.log('First share structure:', data[0] ? JSON.stringify(data[0], null, 2) : 'No data');
        
        if (data.length === 0) {
          console.log('No shared images found for this challenge');
          setSharedImages([]);
          return;
        }
        
        // API 응답 데이터를 컴포넌트에서 사용할 수 있는 형태로 변환
        const transformedData = data.map((share, index) => {
          console.log(`Processing share ${index}:`, share);
          
          // 이미지 URL을 찾는 로직 개선
          let imageUrl = null;
          if (share.img_share?.img_url) {
            const imgUrl = share.img_share.img_url;
            console.log(`Original img_url: ${imgUrl}`);
            
            // media/media/... 형태의 URL을 media/... 형태로 변환
            if (imgUrl.startsWith('media/media/')) {
              // 'media/media/' 부분을 'media/'로 변경
              imageUrl = `http://localhost:8000/media/${imgUrl.substring(12)}`;
              console.log(`Converted URL: ${imageUrl}`);
            } else {
              imageUrl = `http://localhost:8000/${imgUrl}`;
              console.log(`Direct URL: ${imageUrl}`);
            }
          } else if (share.img_url) {
            const imgUrl = share.img_url;
            if (imgUrl.startsWith('media/media/')) {
              imageUrl = `http://localhost:8000/media/${imgUrl.substring(12)}`;
            } else {
              imageUrl = `http://localhost:8000/${imgUrl}`;
            }
          } else if (share.image_url) {
            const imgUrl = share.image_url;
            if (imgUrl.startsWith('media/media/')) {
              imageUrl = `http://localhost:8000/media/${imgUrl.substring(12)}`;
            } else {
              imageUrl = `http://localhost:8000/${imgUrl}`;
            }
          } else if (share.url) {
            const imgUrl = share.url;
            if (imgUrl.startsWith('media/media/')) {
              imageUrl = `http://localhost:8000/media/${imgUrl.substring(12)}`;
            } else {
              imageUrl = `http://localhost:8000/${imgUrl}`;
            }
          }
          
          console.log(`Share ${index} image URL:`, imageUrl);
          
          return {
            id: share.id || index,
            prompt: share.prompt || '프롬프트를 불러올 수 없습니다.',
            image: imageUrl,
            likes: share.likes || [],
            likes_count: share.likes_count || 0,
            user: share.user || null,
            created_at: share.created_at || new Date().toISOString()
          };
        });
        
        console.log('Transformed shared images:', transformedData);
        setSharedImages(transformedData);
      } catch (err) {
        console.error('Failed to fetch shared images:', err);
        // 에러 시 기본 데이터 사용 (실제 백엔드 이미지 URL 사용)
        setSharedImages([
          {
            id: 1,
            prompt: '일상 풍경을 묘사한 프롬프트',
            image: 'http://localhost:8000/media/shares/img_shares/1_generated_image_1755844087.png',
            likes: [],
            likes_count: 15,
            user: { username: 'user1' },
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            prompt: '자연스러운 풍경 묘사',
            image: 'http://localhost:8000/media/shares/img_shares/1_generated_image_1755845877.png',
            likes: [],
            likes_count: 12,
            user: { username: 'user2' },
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            prompt: '도시 풍경 묘사',
            image: 'http://localhost:8000/media/shares/img_shares/1_generated_image_1755846010.png',
            likes: [],
            likes_count: 8,
            user: { username: 'user3' },
            created_at: new Date().toISOString()
          },
          {
            id: 4,
            prompt: '자연과 도시의 조화',
            image: 'http://localhost:8000/media/shares/img_shares/1_generated_image_1755846584.png',
            likes: [],
            likes_count: 20,
            user: { username: 'user4' },
            created_at: new Date().toISOString()
          }
        ]);
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
    try {
      const response = await fetch(`http://localhost:3000/challenges/img/${id}/generate`, {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const imageUrl = await response.json();
      let imagePath = imageUrl;
      if (imagePath.startsWith('media/')) {
        imagePath = imagePath.substring(6);
      }
      // 백엔드에서 "media/..." 형태의 상대 경로를 반환하므로, "/"를 추가하여 전체 URL을 만들어줍니다.
      const fullImageUrl = `http://localhost:3000/${imagePath}`;
      setGeneratedImageUrl(fullImageUrl);
      setIsGenerated(true);
    } catch (error) {
      console.error('Failed to generate image:', error);
      if (error.message !== 'Unauthorized') {
        alert('이미지 생성에 실패했습니다.');
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
      
      const response = await fetch(`http://localhost:8000/shares/${shareId}/like`, {
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
                            <img src={generatedImageUrl} alt="Generated" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                              src={share.image} 
                              alt={`Shared submission ${i + 1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                console.error(`Failed to load image for share ${share.id}:`, share.image);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
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
                  <img src={selectedImage.image} alt="Selected submission" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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