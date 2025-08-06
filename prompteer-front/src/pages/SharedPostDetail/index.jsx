import React, { useState } from 'react';
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

  // 프롬프트 공유 게시물 데이터 (실제로는 API에서 id로 조회)
  const getSharedPostData = (postId) => {
    // 샘플 데이터 - 실제로는 API 호출
    const samplePosts = {
      '6': {
        title: '코알라 프롬포트 공유합니다~',
        author: '뽀복',
        date: '25/7/27',
        challengeTitle: 'Challenge #11 코알라 만들기',
        likes: 10,
        type: '프롬포트 공유',
        imageUrl: '/images/koala-example.jpg', // 샘플 이미지 경로
        problemDescription: {
          constraints: {
            time: '1초',
            memory: '256MB'
          },
          situation: `이미지 생성 AI를 사용하여 귀여운 코알라 캐릭터를 만드는 문제입니다.

다음 조건을 만족하는 코알라 이미지를 생성해야 합니다:
- 귀여운 표정의 코알라
- 밝은 배경
- 만화 스타일
- 고화질 이미지

프롬프트 엔지니어링 기법을 활용하여 최적의 결과물을 만들어보세요.`
        },
        content: `프롬포트 어쩌구 저쩌구 이렇게 저렇게.....
[생략]




[프롬포트끝]


내가 생각해도 너무 잘 짰어용..`
      }
    };
    
    return samplePosts[postId] || samplePosts['6'];
  };

  const postData = getSharedPostData(id);
  
  const [activeTab, setActiveTab] = useState('프롬포트 공유');
  const [activeCategory, setActiveCategory] = useState('이미지');

  const tabs = ['전체', '질문', '프롬포트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상', '탈옥', '문서'];

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
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </FilterButton>
                  ))}
                </div>
                <FilterButton variant="action">
                  게시물 작성
                </FilterButton>
              </div>

              <div className="category-filter-section">
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
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
                        <h2 className="shared-post-card-title">{postData.title}</h2>
                        <div className="shared-post-card-meta">
                          <span className="shared-post-card-author">작성자: {postData.author}</span>
                          <span className="shared-post-card-date">{postData.date}</span>
                        </div>
                      </div>
                      <hr className="shared-post-card-divider" />
                    </div>

                    <div className="shared-post-card-challenge">
                      <div className="challenge-header">
                        <h3 className="challenge-title">{postData.challengeTitle}</h3>
                        <div className="challenge-likes">
                          <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                            <path d="M10 17.5L8.55 16.2C3.4 11.74 0 8.74 0 5.5C0 3.42 1.42 2 3.5 2C4.64 2 5.88 2.59 6.5 3.5C7.12 2.59 8.36 2 9.5 2C11.58 2 13 3.42 13 5.5C13 8.74 9.6 11.74 4.45 16.2L10 17.5Z" fill="#515151"/>
                          </svg>
                          <span>{postData.likes}</span>
                        </div>
                      </div>
                      
                      <div className="problem-view-section">
                        <div className="problem-view-card">
                          {isProblemExpanded && (
                            <div className="problem-expanded-content">
                              <div className="problem-section">
                                <h4 className="section-title">[제한]</h4>
                                <div className="section-content">
                                  시간 : {postData.problemDescription.constraints.time}<br/>
                                  메모리 : {postData.problemDescription.constraints.memory}
                                </div>
                              </div>
                              
                              <div className="problem-section">
                                <h4 className="section-title">[문제 상황]</h4>
                                <div className="section-content">
                                  {postData.problemDescription.situation}
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
                      
                      <div className="shared-post-content-section">
                        {postData.content}
                      </div>

                      {/* 이미지 섹션 */}
                      <div className="shared-post-image-section">
                        <div className="shared-post-image-placeholder">
                          <div className="image-placeholder-content">
                            <span>이미지 영역</span>
                            <p>476 × 548px</p>
                          </div>
                        </div>
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