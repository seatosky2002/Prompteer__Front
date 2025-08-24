import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import FilterButton from '../../components/ui/FilterButton/index.jsx';
import CategoryFilter from '../../components/ui/CategoryFilter/index.jsx';

import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isProblemExpanded, setIsProblemExpanded] = useState(true);
  const [postData, setPostData] = useState(null);
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('질문');
  const [activeCategory, setActiveCategory] = useState('코딩');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 게시글 데이터 가져오기
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/posts/${id}`);
        
        if (!response.ok) {
          throw new Error('게시글을 불러오는데 실패했습니다.');
        }
        
        const post = await response.json();
        console.log('Post data:', post);
        setPostData(post);
        
        // 게시글에서 댓글 데이터 추출
        if (post.comments) {
          setComments(post.comments);
          console.log('Comments from post:', post.comments);
        }
        
        // 게시글 타입에 따라 activeTab 설정
        if (post.type === 'share') {
          setActiveTab('프롬프트 공유');
        } else {
          setActiveTab('질문');
        }
        
        // 챌린지 ID가 있으면 챌린지 데이터도 가져오기
        if (post.challenge_id) {
          await fetchChallengeData(post.challenge_id);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
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

  // 게시글 데이터 새로고침 (댓글 포함)
  const refreshPostData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/posts/${id}`);
      
      if (!response.ok) {
        console.warn('게시글 데이터를 새로고침할 수 없습니다.');
        return;
      }
      
      const post = await response.json();
      setPostData(post);
      
      // 댓글 데이터 업데이트
      if (post.comments) {
        setComments(post.comments);
        console.log('Updated comments:', post.comments);
      }
    } catch (err) {
      console.error('Error refreshing post data:', err);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:8000/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          post_id: parseInt(id)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '댓글 작성에 실패했습니다.');
      }

      const newCommentData = await response.json();
      console.log('New comment created:', newCommentData);
      
      // 게시글 데이터 새로고침 (댓글 포함)
      await refreshPostData();
      
      // 입력 필드 초기화
      setNewComment('');
      
      // 성공 메시지는 댓글이 추가된 것으로 충분함
    } catch (error) {
      console.error('Comment creation error:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="post-detail-page">
        <Header />
        <main className="post-detail-main">
          <div className="loading-message">게시글을 불러오는 중...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-page">
        <Header />
        <main className="post-detail-main">
          <div className="error-message">에러: {error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="post-detail-page">
        <Header />
        <main className="post-detail-main">
          <div className="error-message">게시글을 찾을 수 없습니다.</div>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs = ['전체', '질문', '프롬프트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상'];

  const handleFilterNavigate = (filterType, value) => {
    const typeMapping = { '질문': 'question', '프롬프트 공유': 'share' };
    const tagMapping = { '코딩': 'ps', '이미지': 'img', '영상': 'video' };

    const params = new URLSearchParams();
    if (filterType === 'type' && value !== '전체') {
      params.set('type', typeMapping[value]);
    } else if (filterType === 'tag' && value !== '전체') {
      params.set('tag', tagMapping[value]);
    }
    
    navigate(`/board?${params.toString()}`);
  };

  const handleProblemView = () => {
    navigate(`/board/post/${id}/problem`);
  };

  const toggleProblemExpanded = () => {
    setIsProblemExpanded(!isProblemExpanded);
  };



  return (
    <div className="post-detail-page">
      <Header />
      <main className="post-detail-main">
        <div className="post-detail-container">
          {/* 페이지 헤더 */}
          <div className="post-detail-header">
            <div className="post-detail-title-section">
              <h1 className="post-detail-title">게시판</h1>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="post-detail-content">
            {/* 필터 섹션 */}
            <div className="post-detail-filters">
              <div className="tab-filters">
                <div className="tab-buttons">
                  {tabs.map((tab) => (
                    <FilterButton
                      key={tab}
                      isActive={activeTab === tab}
                      onClick={() => handleFilterNavigate('type', tab)}
                    >
                      {tab}
                    </FilterButton>
                  ))}
                </div>
                <FilterButton variant="action" onClick={() => navigate('/board/write')}>
                  게시물 작성
                </FilterButton>
              </div>

              <div className="category-filter-section">
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={(category) => handleFilterNavigate('tag', category)}
                />
              </div>
            </div>

            {/* 게시물 상세 */}
            <div className="post-detail-body">
              <div className="post-detail-card">
                <div className="post-card-background"></div>
                <div className="post-card-content">
                  <div className="post-card-main">
                    <div className="post-card-header">
                      <div className="post-card-title-section">
                        <h2 className="post-card-title">{postData.title}</h2>
                        <div className="post-card-meta">
                          <span className="post-card-author">작성자: {postData.user?.nickname || '익명'}</span>
                          <span className="post-card-date">{new Date(postData.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <hr className="post-card-divider" />
                    </div>

                    <div className="post-card-challenge">
                      {challengeData && (
                        <div className="challenge-header">
                          <h3 className="challenge-title">Challenge #{postData.challenge_id} {challengeData.title}</h3>
                        </div>
                      )}
                      
                      {/* 문제 상세 내용 (챌린지 데이터가 있는 경우) */}
                      {challengeData && (
                        <div className="problem-content-section">
                          {isProblemExpanded && (
                            <div className="problem-content-card">
                              <div className="problem-section">
                                <h4 className="section-title">[제한]</h4>
                                <div className="section-content">
                                  시간 : {challengeData.time_limit || '1초'}<br/>
                                  메모리 : {challengeData.memory_limit || '256MB'}
                                </div>
                              </div>
                              
                              <div className="problem-section">
                                <h4 className="section-title">[문제 설명]</h4>
                                <div className="section-content">
                                  {challengeData.content}
                                </div>
                              </div>

                              {challengeData.level && (
                                <div className="problem-section">
                                  <h4 className="section-title">[난이도]</h4>
                                  <div className="section-content">
                                    {challengeData.level}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="problem-expand-icon" onClick={toggleProblemExpanded}>
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
                      )}
                      
                      {/* 게시글 내용 - 작성자가 직접 작성한 질문이나 설명 */}
                      <div className="post-card-text">
                        {postData.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 댓글 섹션 */}
              <div className="comments-section">
                <div className="comments-header">
                  <h3 className="comments-title">댓글 ({comments.length})</h3>
                </div>
                
                <div className="figma-comments-container">
                  {comments.length === 0 ? (
                    <div className="no-comments">
                      <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="figma-comment-item">
                        <div className="figma-comment-content">
                          {comment.content}
                        </div>
                        <div className="figma-comment-author">
                          {comment.user?.nickname || '익명'}
                        </div>
                      </div>
                    ))
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

export default PostDetail;