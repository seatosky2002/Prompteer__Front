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

  const tabs = ['전체', '질문', '프롬포트 공유'];
  const categories = ['전체', '코딩', '이미지', '영상', '탈옥', '문서'];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      const typeMapping = {
        '질문': 'question',
        '프롬포트 공유': 'share'
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

      try {
        const response = await fetch(`http://localhost:8000/posts/?${params.toString()}`);
        if (!response.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }
        const data = await response.json();

        console.log('게시판 API 응답 데이터:', data);
        console.log('첫 번째 게시물 데이터:', data[0]);

        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab, activeCategory]);

  const handleWriteClick = () => {
    navigate('/board/write');
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
                  posts.map((post) => (
                    <BoardPostCard
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      category={post.tag.toUpperCase()} // e.g., 'PS'
                      problemNumber={post.challenge_id || (post.type === 'share' ? '프롬포트 공유' : '-')}
                      problemNumber={post.challenge_id || '-'}
                      author={post.user?.nickname || '익명'}
                      comments={post.comments?.length || 0}
                      likes={post.likes_count || 0}
                      date={new Date(post.created_at).toLocaleDateString()}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 페이지네이션 */}
            <div className="board-pagination">
              {/* 페이지네이션 로직은 추후 구현 */}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Board;