import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import FilterButton from '../../components/ui/FilterButton/index.jsx';
import CategoryFilter from '../../components/ui/CategoryFilter/index.jsx';
import CommentCard from '../../components/ui/CommentCard/index.jsx';
import './SharedPostDetail.css';

const SharedPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isProblemExpanded, setIsProblemExpanded] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API로부터 share 데이터 가져오기
  useEffect(() => {
    const fetchShareData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/shares/${id}`);
        
        if (!response.ok) {
          throw new Error('공유 데이터를 불러오는데 실패했습니다.');
        }
        
        const share = await response.json();
        console.log('Share data:', share);
        setShareData(share);
        
        // 챌린지 데이터도 가져오기
        if (share.challenge_id) {
          await fetchChallengeData(share.challenge_id);
        }
      } catch (err) {
        console.error('Error fetching share:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShareData();
  }, [id]);

  // 챌린지 데이터 가져오기
  const fetchChallengeData = async (challengeId) => {
    try {
      const response = await fetch(`http://localhost:8000/challenges/${challengeId}`);
      
      if (!response.ok) {
        console.warn('챌린지 데이터를 불러올 수 없습니다.');
        return;
      }
      
      const challenge = await response.json();
      console.log('Challenge data:', challenge);
      setChallengeData(challenge);
    } catch (err) {
      console.error('Error fetching challenge:', err);
    }
  };


  
  const [activeTab, setActiveTab] = useState('프롬프트 공유');
  const [activeCategory, setActiveCategory] = useState('이미지');

  const tabs = ['전체', '질문', '프롬프트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상'];

  // 댓글 데이터 (예시)
  const comments = [
    { id: 1, content: '우왕', author: '뽀복' },
    { id: 2, content: '대단해용', author: '뽀복' }
  ];

  const toggleProblemExpanded = () => {
    setIsProblemExpanded(!isProblemExpanded);
  };

  const handleCommentSubmit = () => {
    console.log('댓글 작성 버튼 클릭됨');
  };

  // 탭 클릭 핸들러
  const handleTabClick = (tab) => {
    if (tab === '전체') {
      navigate('/board');
    } else if (tab === '질문') {
      navigate('/board?type=question');
    } else if (tab === '프롬프트 공유') {
      navigate('/board?type=share');
    }
    setActiveTab(tab);
  };

  // 카테고리 클릭 핸들러  
  const handleCategoryClick = (category) => {
    if (category === '코딩') {
      navigate('/board?tag=ps');
    } else if (category === '이미지') {
      navigate('/board?tag=img');
    } else if (category === '영상') {
      navigate('/board?tag=video');
    }
    setActiveCategory(category);
  };

  // 게시물 작성 버튼 클릭 핸들러
  const handlePostWriteClick = () => {
    navigate('/board/write');
  };

  if (loading) {
    return (
      <div className="shared-post-detail-page">
        <Header />
        <main className="shared-post-detail-main">
          <div className="loading-message">데이터를 불러오는 중...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-post-detail-page">
        <Header />
        <main className="shared-post-detail-main">
          <div className="error-message">오류: {error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="shared-post-detail-page">
        <Header />
        <main className="shared-post-detail-main">
          <div className="error-message">공유 데이터를 찾을 수 없습니다.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="shared-post-detail-page">
      <Header />
      <main className="shared-post-detail-main">
        <div className="shared-post-detail-container">
          {/* 페이지 헤더 */}
          <div className="shared-post-detail-header">
            <div className="shared-post-detail-title-section">
              <h1 className="shared-post-detail-title">게시판</h1>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="shared-post-detail-content">
            {/* 필터 섹션 */}
            <div className="shared-post-detail-filters">
              <div className="tab-filters">
                <div className="tab-buttons">
                  {tabs.map((tab) => (
                    <FilterButton
                      key={tab}
                      isActive={activeTab === tab}
                      onClick={() => handleTabClick(tab)}
                    >
                      {tab}
                    </FilterButton>
                  ))}
                </div>
                <FilterButton variant="action" onClick={handlePostWriteClick}>
                  게시물 작성
                </FilterButton>
              </div>

              <div className="category-filter-section">
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={handleCategoryClick}
                />
              </div>
            </div>

            {/* 게시물 상세 */}
            <div className="shared-post-detail-body">
              <div className="shared-post-detail-card">
                <div className="shared-post-card-background"></div>
                <div className="shared-post-card-content">
                  <div className="shared-post-card-main">
                    <div className="shared-post-card-header">
                      <div className="shared-post-card-title-section">
                        <h2 className="shared-post-card-title">
                          {challengeData?.title || '이미지 프롬프트 공유'}
                        </h2>
                        <div className="shared-post-card-meta">
                          <span className="shared-post-card-author">작성자: {shareData.user?.nickname || '익명'}</span>
                          <span className="shared-post-card-date">
                            {new Date(shareData.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <hr className="shared-post-card-divider" />
                    </div>

                    <div className="shared-post-card-challenge">
                      <div className="challenge-header">
                        <h3 className="challenge-title">
                          {challengeData?.title || `Challenge #${shareData.challenge_id}`}
                        </h3>
                        <div className="challenge-likes">
                          <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                            <path d="M10 17.5L8.55 16.2C3.4 11.74 0 8.74 0 5.5C0 3.42 1.42 2 3.5 2C4.64 2 5.88 2.59 6.5 3.5C7.12 2.59 8.36 2 9.5 2C11.58 2 13 3.42 13 5.5C13 8.74 9.6 11.74 4.45 16.2L10 17.5Z" fill="#515151"/>
                          </svg>
                          <span>{shareData.likes_count || 0}</span>
                        </div>
                      </div>
                      
                      <div className="problem-view-section">
                        <div className="problem-view-card">
                          {isProblemExpanded && (
                            <div className="problem-expanded-content">
                              <div className="problem-section">
                                <h4 className="section-title">[제한]</h4>
                                <div className="section-content">
                                  시간 : {challengeData?.time_limit || '제한없음'}<br/>
                                  메모리 : {challengeData?.memory_limit || '제한없음'}
                                </div>
                              </div>
                              
                              <div className="problem-section">
                                <h4 className="section-title">[문제 설명]</h4>
                                <div className="section-content">
                                  {challengeData?.content || '이미지 생성 프롬프트 공유입니다.'}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="problem-view-header" onClick={toggleProblemExpanded}>
                            <div className="problem-view-content">
                              <span className="problem-view-text">문제 보기</span>
                            </div>
                            <div className="problem-view-icon">
                              <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                                <path 
                                  d={isProblemExpanded ? "M13 8L7 2L1 8" : "M1 1L7 7L13 1"} 
                                  stroke="#000000" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 사용한 프롬프트 섹션 */}
                      <div className="user-prompt-section">
                        <h4 className="section-title">사용한 프롬프트</h4>
                        <div className="prompt-content">
                          {shareData.prompt || '프롬프트 정보가 없습니다.'}
                        </div>
                      </div>

                      {/* 생성된 이미지 섹션 */}
                      <div className="shared-post-image-section">
                        <h4 className="section-title">생성된 이미지</h4>
                        {shareData.img_share?.img_url ? (
                          <div className="generated-image-container">
                            <img 
                              src={(() => {
                                const url = shareData.img_share.img_url;
                                console.log('Raw image URL from API:', url);
                                
                                if (url.startsWith('http')) {
                                  return url;
                                }
                                
                                // URL 정리: media/media/ 중복 제거
                                let cleanUrl = url;
                                
                                // media/media/로 시작하는 경우 첫 번째 media/ 제거
                                if (url.startsWith('media/media/')) {
                                  cleanUrl = url.substring(6); // 'media/' 제거
                                  cleanUrl = `/${cleanUrl}`;
                                } else if (url.startsWith('media/')) {
                                  cleanUrl = `/${url}`;
                                } else if (!url.startsWith('/')) {
                                  cleanUrl = `/${url}`;
                                }
                                
                                const finalUrl = `http://localhost:8000${cleanUrl}`;
                                console.log('Final image URL:', finalUrl);
                                return finalUrl;
                              })()}
                              alt="생성된 이미지"
                              className="generated-image"
                              onLoad={(e) => {
                                console.log('✅ Image loaded successfully:', e.target.src);
                              }}
                              onError={(e) => {
                                console.error('❌ Image failed to load:', e.target.src);
                                console.log('Original URL from API:', shareData.img_share.img_url);
                                
                                // 여러 URL 시도
                                const originalUrl = shareData.img_share.img_url;
                                const alternativeUrls = [
                                  `http://localhost:8000/media${originalUrl}`,
                                  `http://localhost:8000/static${originalUrl}`,
                                  `http://localhost:8000${originalUrl}`,
                                  originalUrl
                                ];
                                
                                console.log('Trying alternative URLs:', alternativeUrls);
                                
                                e.target.parentElement.innerHTML = `
                                  <div class="image-error-fallback">
                                    <span>이미지를 불러올 수 없습니다</span>
                                    <p>시도한 경로: ${e.target.src}</p>
                                    <p>원본 URL: ${originalUrl}</p>
                                  </div>
                                `;
                              }}
                            />
                          </div>
                        ) : (
                          <div className="generated-image-container">
                            <div className="image-error-fallback">
                              <span>이미지가 없습니다</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 댓글 섹션 */}
              <div className="comments-section">
                <div className="comments-list">
                  {comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      content={comment.content}
                      author={comment.author}
                    />
                  ))}
                </div>
                
                <div className="comment-write-section">
                  <button className="comment-submit-btn" onClick={handleCommentSubmit}>
                    댓글 작성
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SharedPostDetail;