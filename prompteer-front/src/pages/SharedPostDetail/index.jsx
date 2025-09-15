import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import FilterButton from '../../components/ui/FilterButton/index.jsx';
import CategoryFilter from '../../components/ui/CategoryFilter/index.jsx';
import CommentCard from '../../components/ui/CommentCard/index.jsx';
import { getCurrentUser } from '../../apis/api.js';
import './SharedPostDetail.css';

const SharedPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isProblemExpanded, setIsProblemExpanded] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // JWT 토큰에서 사용자 ID 추출하는 함수 (기존 코드와의 호환성을 위해 유지)
  const getCurrentUserId = useCallback(() => {
    return currentUser?.id || null;
  }, [currentUser]);

  // 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setIsLoggedIn(false);
        setCurrentUser(null);
        return;
      }

      try {
        // 실제 API로 토큰 유효성 검증
        const result = await getCurrentUser();

        if (result.success) {
          setIsLoggedIn(true);
          setCurrentUser(result.data);
        } else {
          // 토큰이 있지만 만료되었거나 무효함 (axios interceptor가 이미 토큰 삭제 처리함)
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (error) {
        // API 호출 실패 (네트워크 오류 등)
        console.error("Login status check failed:", error);
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };

    checkLoginStatus();
    
    const handleFocus = () => {
      checkLoginStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []); // 빈 의존성 배열로 한 번만 실행



  // API로부터 share 데이터 가져오기
  useEffect(() => {
    const fetchShareData = async () => {
      try {
        setLoading(true);
        
        // 먼저 모든 타입의 shares를 확인해서 해당 ID가 있는지 찾기
        let shareData = null;
        let shareType = null;
        
        // 각 타입별로 확인
        const types = ['ps', 'img', 'video'];
        for (const type of types) {
          try {
            console.log(`Fetching ${type} shares for ID ${id}...`);
            const response = await fetch(`/api/shares/${type}/`);
            console.log(`${type} shares response status:`, response.status);
            if (response.ok) {
              const shares = await response.json();
              console.log(`${type} shares data:`, shares);
              const foundShare = shares.find(share => share.id === parseInt(id));
              console.log(`Found share in ${type}:`, foundShare);
              if (foundShare) {
                shareData = foundShare;
                shareType = type;
                break;
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch ${type} shares:`, err);
          }
        }
        
        if (!shareData) {
          throw new Error('공유 데이터를 찾을 수 없습니다.');
        }
        
        console.log('Share data:', shareData);
        
        // Post 형태로 변환
        const postData = {
          id: shareData.id,
          type: 'share',
          tag: shareType,
          title: `${shareType === 'ps' ? '코딩' : shareType === 'img' ? '이미지' : '비디오'} 챌린지 #${shareData.challenge_id} - 프롬프트 공유`,
          content: `**프롬프트:**\n${shareData.prompt || `${shareType} 생성`}\n\n**결과물:**\n${shareType === 'ps' ? '코딩 챌린지 해결 결과' : shareType === 'img' ? `![생성된 이미지](/api/${shareData.img_share?.img_url})` : `[영상 파일](/api/${shareData.video_share?.video_url})`}`,
          user: shareData.user,
          created_at: shareData.created_at,
          challenge_id: shareData.challenge_id,
          likes_count: shareData.likes_count || 0,
          comments: [] // shares에는 댓글이 없으므로 빈 배열
        };
        
        setShareData(postData);
        
        // 좋아요 정보 설정
        setLikesCount(postData.likes_count);
        
        // 현재 사용자가 좋아요를 눌렀는지 확인
        const currentUserId = currentUser?.id;
        if (currentUserId && shareData.likes) {
          const userLiked = shareData.likes.some(like => like.user_id === currentUserId);
          setIsLiked(userLiked);
        }
        
        // 챌린지 데이터도 가져오기
        if (shareData.challenge_id) {
          await fetchChallengeData(shareData.challenge_id);
        }
        
        // 연결된 Post의 댓글도 가져오기
        const postsResponse = await fetch('/api/posts/');
        const posts = await postsResponse.json();
        const relatedPost = posts.find(post => 
          post.type === 'share' && 
          post.challenge_id === shareData.challenge_id
        );
        
        if (relatedPost) {
          setShareData(prev => ({
            ...prev,
            comments: relatedPost.comments || []
          }));
        }
      } catch (err) {
        console.error('Error fetching share:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShareData();
  }, [id, currentUser]);

  // 챌린지 데이터 가져오기
  const fetchChallengeData = async (challengeId) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}`);
      
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



  const toggleProblemExpanded = () => {
    setIsProblemExpanded(!isProblemExpanded);
  };

  // 좋아요 토글 함수
  const handleLikeToggle = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }

    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/shares/${id}/like`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 409) {
          // 이미 좋아요를 누른 경우 (POST 요청 시)
          console.log('Already liked this share');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 상태 업데이트
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
      
      console.log(`${isLiked ? 'Unliked' : 'Liked'} share ${id}`);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  // 공유 데이터 새로고침
  const refreshShareData = async () => {
    try {
      // 각 타입별로 확인해서 해당 share 찾기
      const types = ['ps', 'img', 'video'];
      for (const type of types) {
        try {
          const response = await fetch(`/api/shares/${type}/`);
          if (response.ok) {
            const shares = await response.json();
            const foundShare = shares.find(share => share.id === parseInt(id));
            if (foundShare) {
              // Post 형태로 변환
              const postData = {
                id: foundShare.id,
                type: 'share',
                tag: type,
                title: `${type === 'ps' ? '코딩' : type === 'img' ? '이미지' : '비디오'} 챌린지 #${foundShare.challenge_id} - 프롬프트 공유`,
                content: `**프롬프트:**\n${foundShare.prompt || `${type} 생성`}\n\n**결과물:**\n${type === 'ps' ? '코딩 챌린지 해결 결과' : type === 'img' ? `![생성된 이미지](/api/${foundShare.img_share?.img_url})` : `[영상 파일](/api/${foundShare.video_share?.video_url})`}`,
                user: foundShare.user,
                created_at: foundShare.created_at,
                challenge_id: foundShare.challenge_id,
                likes_count: foundShare.likes_count || 0,
                comments: []
              };
              
              setShareData(postData);
              setLikesCount(postData.likes_count);
              break;
            }
          }
        } catch (err) {
          console.warn(`Failed to refresh ${type} share:`, err);
        }
      }
    } catch (err) {
      console.error('Error refreshing share data:', err);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 공유된 게시물의 challenge_id로 해당하는 Post 찾기
      const postsResponse = await fetch('/api/posts/');
      const posts = await postsResponse.json();
      
      // 같은 challenge_id와 type='share'인 Post 찾기
      const relatedPost = posts.find(post => 
        post.type === 'share' && 
        post.challenge_id === shareData.challenge_id
      );
      
      if (!relatedPost) {
        alert('해당 공유 게시물에 연결된 Post를 찾을 수 없습니다.');
        return;
      }

      // 2. 찾은 Post ID로 댓글 작성
      const commentData = {
        content: newComment.trim(),
        post_id: relatedPost.id
      };

      const response = await fetch(`/api/posts/${relatedPost.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(commentData)
      });

      if (response.ok) {
        setNewComment('');
        alert('댓글이 작성되었습니다.');
        // 댓글 목록 새로고침 (Post에서 댓글 가져오기)
        await refreshComments(relatedPost.id);
      } else {
        const errorData = await response.json();
        alert(`댓글 작성 실패: ${errorData.detail || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('댓글 작성 에러:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 댓글 목록 새로고침
  const refreshComments = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (response.ok) {
        const postData = await response.json();
        setShareData(prev => ({
          ...prev,
          comments: postData.comments || []
        }));
      }
    } catch (error) {
      console.error('댓글 목록 새로고침 에러:', error);
    }
  };

  // 탭 클릭 핸들러
  const handleTabClick = (tab) => {
    const typeMapping = { '질문': 'question', '프롬프트 공유': 'share' };
    const tagMapping = { '코딩': 'ps', '이미지': 'img', '영상': 'video' };

    const params = new URLSearchParams();
    
    // 타입 필터 설정
    if (tab !== '전체' && typeMapping[tab]) {
      params.set('type', typeMapping[tab]);
    }
    
    // 기존 카테고리 필터 유지
    if (activeCategory !== '전체' && tagMapping[activeCategory]) {
      params.set('tag', tagMapping[activeCategory]);
    }
    
    const queryString = params.toString();
    navigate(queryString ? `/board?${queryString}` : '/board');
    setActiveTab(tab);
  };

  // 카테고리 클릭 핸들러  
  const handleCategoryClick = (category) => {
    const typeMapping = { '질문': 'question', '프롬프트 공유': 'share' };
    const tagMapping = { '코딩': 'ps', '이미지': 'img', '영상': 'video' };

    const params = new URLSearchParams();
    
    // 카테고리 필터 설정
    if (category !== '전체' && tagMapping[category]) {
      params.set('tag', tagMapping[category]);
    }
    
    // 기존 타입 필터 유지
    if (activeTab !== '전체' && typeMapping[activeTab]) {
      params.set('type', typeMapping[activeTab]);
    }
    
    const queryString = params.toString();
    navigate(queryString ? `/board?${queryString}` : '/board');
    setActiveCategory(category);
  };

  // 게시물 작성 버튼 클릭 핸들러
  const handlePostWriteClick = () => {
    navigate('/board/write');
  };

  if (loading) {
    return (
      <div className="shared-post-detail-page">
        <Header isLoggedIn={isLoggedIn} />
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
        <Header isLoggedIn={isLoggedIn} />
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
        <Header isLoggedIn={isLoggedIn} />
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
                          {shareData?.title || '프롬프트 공유'}
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
                        <div className="challenge-title-with-heart">
                          <h3 className="challenge-title">
                            {challengeData?.title || `Challenge #${shareData.challenge_id}`}
                          </h3>
                          {/* 좋아요 섹션 - Challenge Title 오른쪽으로 이동 */}
                          <div className="shared-post-like-section">
                            <button 
                              className={`like-button ${isLiked ? 'liked' : ''}`}
                              onClick={handleLikeToggle}
                            >
                              <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span>
                              <span className="like-count">{likesCount}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="problem-view-section">
                        <div className="problem-view-card">
                          {isProblemExpanded && (
                            <div className="problem-expanded-content">

                              
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
                      


                      {/* 포스트 내용 섹션 */}
                      <div className="shared-post-content-section">
                        <h4 className="section-title">공유 내용</h4>
                        <div className="post-content-container">
                          {shareData?.content ? (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                img: ({node, ...props}) => (
                                  <div style={{ 
                                    margin: '20px 0', 
                                    textAlign: 'center',
                                    backgroundColor: '#F8F9FA',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    border: '1px solid #E9ECEF'
                                  }}>
                                    <img 
                                      {...props} 
                                      style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '1000px',
                                        height: 'auto', 
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        objectFit: 'contain'
                                      }}
                                      onError={(e) => {
                                        console.error('❌ Markdown image failed to load:', e.target.src);
                                        e.target.parentElement.innerHTML = `
                                          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 200px; color: #6C757D;">
                                            <span>이미지를 불러올 수 없습니다</span>
                                            <p style="font-size: 12px; color: #ADB5BD; margin: 5px 0; word-break: break-all;">${e.target.src}</p>
                                          </div>
                                        `;
                                      }}
                                    />
                                  </div>
                                ),
                                a: ({node, href, children, ...props}) => {
                                  // 비디오 파일 링크인지 확인
                                  if (href && (href.includes('.mp4') || href.includes('video') || children?.[0] === '영상 파일')) {
                                    console.log('Video link detected:', href);
                                    
                                    // media/media/ 중복 제거
                                    let cleanUrl = href;
                                    if (href.includes('media/media/')) {
                                      cleanUrl = href.replace('media/media/', 'media/');
                                    }
                                    
                                    // 상대 경로를 절대 경로로 변환
                                    if (!cleanUrl.startsWith('http')) {
                                      cleanUrl = `/api/${cleanUrl}`;
                                    }
                                    
                                    return (
                                      <div style={{ margin: '20px 0', textAlign: 'center' }}>
                                        <video 
                                          src={cleanUrl}
                                          controls
                                          style={{ 
                                            maxWidth: '100%', 
                                            height: 'auto', 
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                          }}
                                          onError={(e) => {
                                            console.error('❌ Markdown video failed to load:', cleanUrl);
                                            e.target.parentElement.innerHTML = `
                                              <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 200px; background: #F8F9FA; border: 2px dashed #DEE2E6; border-radius: 8px; color: #6C757D;">
                                                <span>영상을 불러올 수 없습니다</span>
                                                <p style="font-size: 12px; color: #ADB5BD; margin: 5px 0; word-break: break-all;">${cleanUrl}</p>
                                              </div>
                                            `;
                                          }}
                                        >
                                          브라우저가 비디오를 지원하지 않습니다.
                                        </video>
                                      </div>
                                    );
                                  }
                                  
                                  // 일반 링크는 그대로 처리
                                  return <a href={href} {...props}>{children}</a>;
                                }
                              }}
                            >
                              {shareData.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="content-placeholder">
                              <span>내용이 없습니다</span>
                            </div>
                          )}
                        </div>
                      </div>


                    </div>
                  </div>
                </div>
              </div>

              {/* 댓글 섹션 */}
              <div className="comments-section">
                <div className="comments-header">
                  <h3 className="comments-title">댓글 ({shareData?.comments?.length || 0})</h3>
                </div>
                
                <div className="figma-comments-container">
                  {shareData?.comments && shareData.comments.length > 0 ? (
                    shareData.comments.map((comment) => (
                      <div key={comment.id} className="figma-comment-item">
                        <div className="figma-comment-content">
                          {comment.content}
                        </div>
                        <div className="figma-comment-author">
                          {comment.user?.nickname || '익명'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-comments">
                      <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                    </div>
                  )}
                </div>
                
                <div className="comment-write-section">
                  {/* Figma 디자인에 맞는 댓글 작성 영역 */}
                  <div className="figma-comment-container">
                    <div className="figma-comment-input-area">
                      <textarea
                        className="figma-comment-input"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCommentSubmit();
                          }
                        }}
                        placeholder="댓글을 입력하세요..."
                        rows={2}
                        disabled={isSubmitting}
                      />
                    </div>
                    <button 
                      className="figma-comment-submit-btn" 
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim() || isSubmitting}
                    >
                      {isSubmitting ? '작성 중...' : '댓글 작성'}
                    </button>
                  </div>
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