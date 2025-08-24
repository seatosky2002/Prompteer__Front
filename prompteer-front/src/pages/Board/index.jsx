import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import FilterButton from '../../components/ui/FilterButton/index.jsx';
import CategoryFilter from '../../components/ui/CategoryFilter/index.jsx';
import BoardPostCard from '../../components/cards/BoardPostCard/index.jsx';
import './Board.css';

const Board = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('전체');
  const [activeCategory, setActiveCategory] = useState('전체');
  
  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [maxVisitedPage, setMaxVisitedPage] = useState(1); // 방문한 최대 페이지
  const postsPerPage = 10;

  const tabs = ['전체', '질문', '프롬프트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상'];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      const typeMapping = {
        '질문': 'question',
        '프롬프트 공유': 'share'
      };
      const tagMapping = {
        '코딩': 'ps',
        '이미지': 'img',
        '영상': 'video'
      };

      const params = new URLSearchParams();
      if (activeTab !== '전체') {
        params.append('types', typeMapping[activeTab]);
      }
      if (activeCategory !== '전체' && tagMapping[activeCategory]) {
        params.append('tags', tagMapping[activeCategory]);
      }
      
      // 페이지네이션 파라미터 추가
      const skip = (currentPage - 1) * postsPerPage;
      params.append('skip', skip);
      params.append('limit', postsPerPage);

      try {
        const response = await fetch(`http://localhost:8000/posts/?${params.toString()}`);
        if (!response.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }
        const data = await response.json();

        console.log('게시판 API 응답 데이터:', data);
        console.log('각 게시물의 ID들:', data.map(post => ({ id: post.id, title: post.title, type: post.type, tag: post.tag })));

        setPosts(data);
        
        // 더 많은 게시물이 있는지 확인 (limit 만큼 데이터가 왔는지로 판단)
        setHasMore(data.length === postsPerPage);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab, activeCategory, currentPage]);

  // 탭이나 카테고리 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
    setMaxVisitedPage(1); // 방문한 최대 페이지도 리셋
  }, [activeTab, activeCategory]);

  const handleWriteClick = () => {
    navigate('/board/write');
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setMaxVisitedPage(prev => Math.max(prev, newPage)); // 방문한 최대 페이지 업데이트
    window.scrollTo(0, 0); // 페이지 상단으로 스크롤
  };

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
                <FilterButton variant="action" onClick={handleWriteClick}>
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
                {loading ? (
                  <p>게시물을 불러오는 중...</p>
                ) : error ? (
                  <p>에러: {error}</p>
                ) : (
                  posts.map((post) => {
                    const cardProps = {
                      key: post.id,
                      id: post.id,
                      title: post.title,
                      type: post.type,
                      tag: post.tag,
                      problemNumber: post.challenge_id || '-',
                      author: post.user?.nickname || '익명',
                      comments: post.comments?.length || 0,
                      likes: post.likes_count || 0,
                      date: new Date(post.created_at).toLocaleDateString()
                    };
                    console.log(`BoardPostCard props for post ${post.id}:`, cardProps);
                    return (
                      <BoardPostCard {...cardProps} />
                    );
                  })
                )}
              </div>
            </div>

            {/* 페이지네이션 */}
            <div className="board-pagination">
              {posts.length > 0 && (
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    이전
                  </button>
                  
                  <div className="pagination-numbers">
                    {/* 방문했던 페이지들과 다음 페이지(데이터가 있는 경우)만 표시 */}
                    {(() => {
                      const pageNumbers = [];
                      
                      // 1페이지부터 방문한 최대 페이지까지 표시
                      for (let i = 1; i <= maxVisitedPage; i++) {
                        pageNumbers.push(
                          <button
                            key={i}
                            className={`pagination-number ${i === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      // 다음 페이지는 hasMore가 true이고 아직 방문하지 않은 경우에만 표시
                      if (hasMore && maxVisitedPage === currentPage) {
                        pageNumbers.push(
                          <button
                            key={maxVisitedPage + 1}
                            className="pagination-number"
                            onClick={() => handlePageChange(maxVisitedPage + 1)}
                          >
                            {maxVisitedPage + 1}
                          </button>
                        );
                      }
                      
                      return pageNumbers;
                    })()}
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasMore}
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Board;