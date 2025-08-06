import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import FilterButton from '../../components/ui/FilterButton/index.jsx';
import CategoryFilter from '../../components/ui/CategoryFilter/index.jsx';
import CommentCard from '../../components/ui/CommentCard/index.jsx';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 게시물 데이터 (실제로는 API에서 id로 조회)
  const getPostData = (postId) => {
    // 샘플 데이터 - 실제로는 API 호출
    const samplePosts = {
      '1': {
        title: '왜 틀렸는지 잘 모르겠습니다.',
        author: '뽀복',
        date: '25/7/27',
        challengeTitle: 'Challenge #13 알고리즘 문제',
        likes: 15,
        type: '질문',
        content: `이 프롬프트를 사용해봤는데 자꾸 틀렸다고 나와요.

"주어진 배열을 정렬하는 함수를 작성해줘. 배열의 원소는 숫자야."

이런 식으로 프롬프트를 작성했는데 뭔가 빠진 게 있을까요?`
      },
      '6': {
        title: '코딩 프롬포트 공유하니까 참고하세영',
        author: '뽀복',
        date: '25/7/27',
        challengeTitle: 'Challenge #11 알파벳 문자열',
        likes: 10,
        type: '프롬포트 공유',
        content: `이 프롬프트 정말 잘 되는 것 같아요:

"너는 알고리즘 문제 해결 전문가야. 주어진 문제를 분석하고, 시간복잡도와 공간복잡도를 고려한 최적의 해결책을 제시해줘. 단계별로 설명하고 코드도 같이 작성해줘."

[프롬포트끝]

이런 식으로 했더니 정답률이 훨씬 올라갔어요!`
      }
    };
    
    return samplePosts[postId] || samplePosts['1'];
  };

  const postData = getPostData(id);
  
  const [activeTab, setActiveTab] = useState(postData.type || '질문');
  const [activeCategory, setActiveCategory] = useState('코딩');

  const tabs = ['전체', '질문', '프롬포트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상', '탈옥', '문서'];

  // 댓글 데이터 (예시)
  const comments = [
    { id: 1, content: '우왕', author: '뽀복' },
    { id: 2, content: '대단해용', author: '뽀복' }
  ];

  const handleProblemView = () => {
    navigate(`/board/post/${id}/problem`);
  };

  const handleCommentSubmit = () => {
    console.log('댓글 작성 버튼 클릭됨');
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
            <div className="post-detail-body">
              <div className="post-detail-card">
                <div className="post-card-background"></div>
                <div className="post-card-content">
                  <div className="post-card-main">
                    <div className="post-card-header">
                      <div className="post-card-title-section">
                        <h2 className="post-card-title">{postData.title}</h2>
                        <div className="post-card-meta">
                          <span className="post-card-author">작성자: {postData.author}</span>
                          <span className="post-card-date">{postData.date}</span>
                        </div>
                      </div>
                      <hr className="post-card-divider" />
                    </div>

                    <div className="post-card-challenge">
                      <div className="challenge-header">
                        <h3 className="challenge-title">{postData.challengeTitle}</h3>
                        <div className="challenge-likes">
                          <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                            <path d="M10 17.5L8.55 16.2C3.4 11.74 0 8.74 0 5.5C0 3.42 1.42 2 3.5 2C4.64 2 5.88 2.59 6.5 3.5C7.12 2.59 8.36 2 9.5 2C11.58 2 13 3.42 13 5.5C13 8.74 9.6 11.74 4.45 16.2L10 17.5Z" fill="#515151"/>
                          </svg>
                          <span>{postData.likes}</span>
                        </div>
                      </div>
                      
                      <div className="challenge-actions">
                        <button className="problem-view-btn" onClick={handleProblemView}>
                          <div className="problem-view-content">
                            <span>문제 보기</span>
                            <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                              <path d="M1 1L7 7L13 1" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </button>
                      </div>
                      
                      <div className="post-card-text">
                        {postData.content}
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

export default PostDetail;