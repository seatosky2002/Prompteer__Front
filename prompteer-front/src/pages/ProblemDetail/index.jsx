import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import FilterButton from '../../components/ui/FilterButton/index.jsx';
import CategoryFilter from '../../components/ui/CategoryFilter/index.jsx';
import CommentCard from '../../components/ui/CommentCard/index.jsx';
import './ProblemDetail.css';

const ProblemDetail = () => {
  const { id } = useParams();
  const [isProblemExpanded, setIsProblemExpanded] = useState(true);

  // 문제 데이터 (실제로는 API에서 id로 조회)
  const getProblemData = (postId) => {
    // 샘플 데이터 - 실제로는 API 호출
    const sampleProblems = {
      '1': {
        title: '왜 틀렸는지 잘 모르겠습니다.',
        author: '뽀복',
        date: '25/7/27',
        challengeTitle: 'Challenge #11 알파벳 문자열',
        likes: 10,
        type: '질문',
        problemDescription: {
          constraints: {
            time: '1초',
            memory: '256MB'
          },
          situation: `알파벳 대문자로만 이루어진 문자열 S가 있고, 길이는 N이다. S[i]는 S의 i번째 문자를 나타내고, S[i:j]는 S[i], S[i+1], ..., S[j-1], S[j]에 해당하는 S의 부분 문자열을 나타낸다. 이 문제에서 사용하는 문자열의 인덱스는 1부터 시작한다.

U(i, j)는 S[i:j]에 나타나는 알파벳을 순서대로 정렬한 문자열을 의미하고, 중복해서 나타나는 알파벳은 제외한다.

예를 들어, S = "ABCBA" 인 경우 U(1, 3) = "ABC"가 되며, U(2, 4) = "BC", U(1, 5) = "ABC"이다.

모든 1 ≤ i ≤ j ≤ N에 대하여 U(i, j)을 구했을 때 이 문자열 중에서 서로 다른 문자열이 모두 몇 개 있는지 구해보자.`
        },
        userPrompt: `프롬포트 어쩌구 저쩌구 이렇게 저렇게.....
[생략]




[프롬포트끝]


이렇게 했는데, 자꾸 메모리 사용이 오버되는데 왜 이런거죠?`
      }
    };
    
    return sampleProblems[postId] || sampleProblems['1'];
  };

  const problemData = getProblemData(id);
  
  const [activeTab, setActiveTab] = useState(problemData.type || '질문');
  const [activeCategory, setActiveCategory] = useState('코딩');

  const tabs = ['전체', '질문', '프롬포트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상', '탈옥', '문서'];

  // 댓글 데이터 (예시)
  const comments = [
    { id: 1, content: '한번 잘 생각해보세요', author: '뽀복' },
    { id: 2, content: '그러게요', author: '뽀복' }
  ];

  const handleCommentSubmit = () => {
    console.log('댓글 작성 버튼 클릭됨');
  };

  const toggleProblemExpanded = () => {
    setIsProblemExpanded(!isProblemExpanded);
  };

  return (
    <div className="problem-detail-page">
      <Header />
      <main className="problem-detail-main">
        <div className="problem-detail-container">
          {/* 페이지 헤더 */}
          <div className="problem-detail-header">
            <div className="problem-detail-title-section">
              <h1 className="problem-detail-title">게시판</h1>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="problem-detail-content">
            {/* 필터 섹션 */}
            <div className="problem-detail-filters">
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

            {/* 문제 상세 */}
            <div className="problem-detail-body">
              <div className="problem-detail-card">
                <div className="problem-card-background"></div>
                <div className="problem-card-content">
                  <div className="problem-card-main">
                    <div className="problem-card-header">
                      <div className="problem-card-title-section">
                        <h2 className="problem-card-title">{problemData.title}</h2>
                        <span className="problem-card-author">작성자: {problemData.author}</span>
                      </div>
                      <hr className="problem-card-divider" />
                    </div>

                    <div className="problem-card-challenge">
                      <div className="challenge-header">
                        <h3 className="challenge-title">{problemData.challengeTitle}</h3>
                        <div className="challenge-likes">
                          <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                            <path d="M10 17.5L8.55 16.2C3.4 11.74 0 8.74 0 5.5C0 3.42 1.42 2 3.5 2C4.64 2 5.88 2.59 6.5 3.5C7.12 2.59 8.36 2 9.5 2C11.58 2 13 3.42 13 5.5C13 8.74 9.6 11.74 4.45 16.2L10 17.5Z" fill="#515151"/>
                          </svg>
                          <span>{problemData.likes}</span>
                        </div>
                      </div>
                      
                      <div className="problem-content-section">
                        {isProblemExpanded && (
                          <div className="problem-content-card">
                            <div className="problem-section">
                              <h4 className="section-title">[제한]</h4>
                              <div className="section-content">
                                시간 : {problemData.problemDescription.constraints.time}<br/>
                                메모리 : {problemData.problemDescription.constraints.memory}
                              </div>
                            </div>
                            
                            <div className="problem-section">
                              <h4 className="section-title">[문제 상황]</h4>
                              <div className="section-content">
                                {problemData.problemDescription.situation}
                              </div>
                            </div>
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
                      
                      <div className="user-prompt-section">
                        {problemData.userPrompt}
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

export default ProblemDetail;