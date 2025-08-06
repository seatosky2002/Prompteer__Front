import React, { useState } from 'react';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import FilterButton from '../../components/ui/FilterButton/index.jsx';
import CategoryFilter from '../../components/ui/CategoryFilter/index.jsx';
import BoardPostCard from '../../components/cards/BoardPostCard/index.jsx';
import './Board.css';

const Board = () => {
  const [activeTab, setActiveTab] = useState('전체');
  const [activeCategory, setActiveCategory] = useState('전체');

  const tabs = ['전체', '질문', '프롬포트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상', '탈옥', '문서'];

  // 샘플 데이터
  const posts = [
    {
      id: 1,
      title: '왜 틀렸는지 잘 모르겠습니다.',
      category: '코딩',
      problemNumber: '13',
      author: '뽀복',
      comments: '3',
      likes: '15',
      date: '25/7/27',
      type: '질문'
    },
    {
      id: 2,
      title: '왜 틀렸는지 잘 모르겠습니다.',
      category: '코딩',
      problemNumber: '13',
      author: '뽀복',
      comments: '3',
      likes: '15',
      date: '25/7/27',
      type: '질문'
    },
    {
      id: 3,
      title: '왜 틀렸는지 잘 모르겠습니다.',
      category: '코딩',
      problemNumber: '13',
      author: '뽀복',
      comments: '3',
      likes: '15',
      date: '25/7/27',
      type: '질문'
    },
    {
      id: 4,
      title: '왜 틀렸는지 잘 모르겠습니다.',
      category: '코딩',
      problemNumber: '13',
      author: '뽀복',
      comments: '3',
      likes: '15',
      date: '25/7/27',
      type: '질문'
    },
    {
      id: 5,
      title: '왜 틀렸는지 잘 모르겠습니다.',
      category: '코딩',
      problemNumber: '13',
      author: '뽀복',
      comments: '3',
      likes: '15',
      date: '25/7/27',
      type: '질문'
    },
    {
      id: 6,
      title: '코딩 프롬포트 공유하니까 참고하세영',
      category: '코딩',
      problemNumber: '13',
      author: '뽀복',
      comments: '3',
      likes: '15',
      date: '25/7/27',
      type: '프롬포트 공유'
    },
    {
      id: 7,
      title: '코딩 프롬포트 공유하니까 참고하세영',
      category: '코딩',
      problemNumber: '13',
      author: '뽀복',
      comments: '3',
      likes: '15',
      date: '25/7/27',
      type: '프롬포트 공유'
    },
    {
      id: 8,
      title: '코딩 프롬포트 공유하니까 참고하세영',
      category: '코딩',
      problemNumber: '13',
      author: '뽀복',
      comments: '3',
      likes: '15',
      date: '25/7/27',
      type: '프롬포트 공유'
    },
    {
      id: 9,
      title: '코딩 프롬포트 공유하니까 참고하세영',
      category: '코딩',
      problemNumber: '13',
      author: '뽀복',
      comments: '3',
      likes: '15',
      date: '25/7/27',
      type: '프롬포트 공유'
    }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === '전체' || post.type === activeTab;
    const matchesCategory = activeCategory === '전체' || post.category === activeCategory;
    return matchesTab && matchesCategory;
  });



  return (
    <div className="board-page">
      <Header />
      <main className="board-main">
        <div className="board-container">
          {/* 페이지 헤더 */}
          <div className="board-header">
            <div className="board-title-section">
              <h1 className="board-title">게시판</h1>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="board-content">
            {/* 필터 섹션 */}
            <div className="board-filters">
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

            {/* 게시물 리스트 */}
            <div className="board-posts">
              {/* 테이블 헤더 */}
              <div className="board-posts-header">
                <div className="header-left">
                  <span className="header-title">제목</span>
                </div>
                <div className="header-right">
                  <span className="header-stat">카테고리</span>
                  <span className="header-stat">문제 번호</span>
                  <span className="header-stat">작성자</span>
                  <span className="header-stat">댓글</span>
                  <span className="header-stat">좋아요</span>
                  <span className="header-stat">작성일</span>
                </div>
              </div>

              {/* 게시물 목록 */}
              <div className="board-posts-list">
                {filteredPosts.map((post) => (
                  <BoardPostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    category={post.category}
                    problemNumber={post.problemNumber}
                    author={post.author}
                    comments={post.comments}
                    likes={post.likes}
                    date={post.date}
                  />
                ))}
              </div>
            </div>

            {/* 페이지네이션 */}
            <div className="board-pagination">
              <button className="pagination-button">
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <path d="M8.75 6.875L14.375 12.5L8.75 18.125" stroke="#FFFFFF" strokeWidth="3"/>
                </svg>
              </button>
              <button className="pagination-button">
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <path d="M10.625 6.875L16.25 12.5L10.625 18.125" stroke="#FFFFFF" strokeWidth="3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Board;