import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import FilterButton from '../../components/ui/FilterButton/index.jsx';
import CategoryFilter from '../../components/ui/CategoryFilter/index.jsx';
import BoardPostCard from '../../components/cards/BoardPostCard/index.jsx';
import './Board.css';

const Board = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // URL 파라미터에서 초기 상태 설정
  useEffect(() => {
    const typeMapping = {
      'question': '질문',
      'share': '프롬프트 공유'
    };
    const tagMapping = {
      'ps': '코딩',
      'img': '이미지',
      'video': '영상'
    };

    const urlType = searchParams.get('type');
    const urlTag = searchParams.get('tag');

    if (urlType && typeMapping[urlType]) {
      setActiveTab(typeMapping[urlType]);
    } else {
      setActiveTab('전체');
    }

    if (urlTag && tagMapping[urlTag]) {
      setActiveCategory(tagMapping[urlTag]);
    } else {
      setActiveCategory('전체');
    }
  }, [searchParams]);

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

      try {
        let data = [];
        
        // 프롬프트 공유 탭인 경우 shares API 사용
        if (activeTab === '프롬프트 공유') {
          const skip = (currentPage - 1) * postsPerPage;
          const limit = postsPerPage;
          
          // 카테고리별로 다른 shares API 호출
          if (activeCategory === '전체') {
            // 모든 카테고리의 공유를 가져오기 위해 각각 호출
            console.log('Fetching all shares...');
            const [psShares, imgShares, videoShares] = await Promise.all([
              fetch(`/api/shares/ps/?skip=${skip}&limit=${limit}`).then(r => r.json()),
              fetch(`/api/shares/img/?skip=${skip}&limit=${limit}`).then(r => r.json()),
              fetch(`/api/shares/video/?skip=${skip}&limit=${limit}`).then(r => r.json())
            ]);
            console.log('PS shares:', psShares);
            console.log('IMG shares:', imgShares);
            console.log('VIDEO shares:', videoShares);
            
            // Post 형태로 변환
            data = [
              ...psShares.map(share => ({
                id: share.id,
                type: 'share',
                tag: 'ps',
                title: `코딩 챌린지 #${share.challenge_id} - 프롬프트 공유`,
                content: `**프롬프트:**\n\`\`\`\n${share.prompt || '코딩 챌린지 해결'}\n\`\`\``,
                user: share.user,
                created_at: share.created_at,
                likes_count: share.likes_count || 0,
                comments: []
              })),
              ...imgShares.map(share => ({
                id: share.id,
                type: 'share',
                tag: 'img',
                title: `이미지 챌린지 #${share.challenge_id} - 프롬프트 공유`,
                content: `**프롬프트:**\n${share.prompt || '이미지 생성'}\n\n**생성된 이미지:**\n![생성된 이미지](/api/${share.img_share?.img_url})`,
                user: share.user,
                created_at: share.created_at,
                likes_count: share.likes_count || 0,
                comments: []
              })),
              ...videoShares.map(share => ({
                id: share.id,
                type: 'share',
                tag: 'video',
                title: `비디오 챌린지 #${share.challenge_id} - 프롬프트 공유`,
                content: `**프롬프트:**\n${share.prompt || '비디오 생성'}\n\n**생성된 비디오:**\n[영상 파일](/api/${share.video_share?.video_url})`,
                user: share.user,
                created_at: share.created_at,
                likes_count: share.likes_count || 0,
                comments: []
              }))
            ];
            
            // 최신순으로 정렬
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          } else {
            // 특정 카테고리만
            const categoryEndpoint = tagMapping[activeCategory];
            const response = await fetch(`/api/shares/${categoryEndpoint}/?skip=${skip}&limit=${limit}`);
            if (!response.ok) {
              throw new Error('데이터를 불러오는 데 실패했습니다.');
            }
            const shares = await response.json();
            
            data = shares.map(share => ({
              id: share.id,
              type: 'share',
              tag: categoryEndpoint,
              title: `${activeCategory} 챌린지 #${share.challenge_id} - 프롬프트 공유`,
              content: `**프롬프트:**\n${share.prompt || `${activeCategory} 생성`}\n\n**결과물:**\n${categoryEndpoint === 'ps' ? '코딩 챌린지 해결 결과' : categoryEndpoint === 'img' ? `![생성된 이미지](/api/${share.img_share?.img_url})` : `[영상 파일](/api/${share.video_share?.video_url})`}`,
              user: share.user,
              created_at: share.created_at,
              likes_count: share.likes_count || 0,
              comments: []
            }));
          }
        } else if (activeTab === '질문') {
          // 질문 탭인 경우 기존 posts API 사용
          const params = new URLSearchParams();
          params.append('types', typeMapping[activeTab]);
          if (activeCategory !== '전체' && tagMapping[activeCategory]) {
            params.append('tags', tagMapping[activeCategory]);
          }
          
          // 페이지네이션 파라미터 추가
          const skip = (currentPage - 1) * postsPerPage;
          params.append('skip', skip);
          params.append('limit', postsPerPage);

          const response = await fetch(`${API_ENDPOINTS.POSTS}/?${params.toString()}`);
          if (!response.ok) {
            throw new Error('데이터를 불러오는 데 실패했습니다.');
          }
          data = await response.json();
        } else {
          // 전체 탭인 경우: 일반 게시물 + 공유 게시물 모두 가져오기
          console.log('Fetching all posts and shares for 전체 탭...');
          
          // 더 많은 데이터를 가져와서 클라이언트 사이드에서 페이지네이션
          const largeLimit = 100; // 충분히 큰 값
          
          // 일반 게시물 가져오기
          const postsParams = new URLSearchParams();
          if (activeCategory !== '전체' && tagMapping[activeCategory]) {
            postsParams.append('tags', tagMapping[activeCategory]);
          }
          postsParams.append('skip', 0);
          postsParams.append('limit', largeLimit);
          
          const [postsResponse, psShares, imgShares, videoShares] = await Promise.all([
            fetch(`${API_ENDPOINTS.POSTS}/?${postsParams.toString()}`).then(r => r.json()),
            fetch(`/api/shares/ps/?skip=0&limit=${largeLimit}`).then(r => r.json()),
            fetch(`/api/shares/img/?skip=0&limit=${largeLimit}`).then(r => r.json()),
            fetch(`/api/shares/video/?skip=0&limit=${largeLimit}`).then(r => r.json())
          ]);
          
          console.log('Posts:', postsResponse);
          console.log('PS shares:', psShares);
          console.log('IMG shares:', imgShares);
          console.log('VIDEO shares:', videoShares);
          
          // 공유 게시물을 Post 형태로 변환
          const sharesAsPosts = [
            ...psShares.map(share => ({
              id: share.id,
              type: 'share',
              tag: 'ps',
              title: `코딩 챌린지 #${share.challenge_id} - 프롬프트 공유`,
              content: `**프롬프트:**\n${share.prompt || '코딩 생성'}\n\n**결과물:**\n코딩 챌린지 해결 결과`,
              user: share.user,
              created_at: share.created_at,
              likes_count: share.likes_count || 0,
              comments: []
            })),
            ...imgShares.map(share => ({
              id: share.id,
              type: 'share',
              tag: 'img',
              title: `이미지 챌린지 #${share.challenge_id} - 프롬프트 공유`,
              content: `**프롬프트:**\n${share.prompt || '이미지 생성'}\n\n**결과물:**\n![생성된 이미지](/api/${share.img_share?.img_url})`,
              user: share.user,
              created_at: share.created_at,
              likes_count: share.likes_count || 0,
              comments: []
            })),
            ...videoShares.map(share => ({
              id: share.id,
              type: 'share',
              tag: 'video',
              title: `비디오 챌린지 #${share.challenge_id} - 프롬프트 공유`,
              content: `**프롬프트:**\n${share.prompt || '비디오 생성'}\n\n**결과물:**\n[영상 파일](/api/${share.video_share?.video_url})`,
              user: share.user,
              created_at: share.created_at,
              likes_count: share.likes_count || 0,
              comments: []
            }))
          ];
          
          // 일반 게시물과 공유 게시물 합치기
          let allData = [...postsResponse, ...sharesAsPosts];
          
          // 카테고리 필터링 (전체가 아닌 경우)
          if (activeCategory !== '전체') {
            allData = allData.filter(post => post.tag === tagMapping[activeCategory]);
          }
          
          // 최신순으로 정렬
          allData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          // 클라이언트 사이드 페이지네이션
          const skip = (currentPage - 1) * postsPerPage;
          data = allData.slice(skip, skip + postsPerPage);
          
          // 더 많은 데이터가 있는지 확인
          setHasMore(skip + postsPerPage < allData.length);
        }

        console.log('게시판 API 응답 데이터:', data);
        console.log('각 게시물의 ID들:', data.map(post => ({ id: post.id, title: post.title, type: post.type, tag: post.tag })));

        setPosts(data);
        
        // 더 많은 게시물이 있는지 확인 (전체 탭이 아닌 경우에만)
        if (activeTab !== '전체') {
          setHasMore(data.length === postsPerPage);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab, activeCategory, currentPage]);

  // 탭이나 카테고리 변경 시 페이지 리셋 및 URL 업데이트
  useEffect(() => {
    setCurrentPage(1);
    setMaxVisitedPage(1); // 방문한 최대 페이지도 리셋
    
    // URL 파라미터 업데이트
    const typeMapping = {
      '질문': 'question',
      '프롬프트 공유': 'share'
    };
    const tagMapping = {
      '코딩': 'ps',
      '이미지': 'img',
      '영상': 'video'
    };

    const newParams = new URLSearchParams();
    
    if (activeTab !== '전체' && typeMapping[activeTab]) {
      newParams.set('type', typeMapping[activeTab]);
    }
    
    if (activeCategory !== '전체' && tagMapping[activeCategory]) {
      newParams.set('tag', tagMapping[activeCategory]);
    }
    
    // URL 업데이트 (페이지 새로고침 없이)
    const newUrl = newParams.toString() ? `${location.pathname}?${newParams.toString()}` : location.pathname;
    navigate(newUrl, { replace: true });
  }, [activeTab, activeCategory]); // navigate와 location.pathname 제거

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
                      onClick={() => {
                        setActiveTab(tab);
                      }}
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
                  onCategoryChange={(category) => {
                    setActiveCategory(category);
                  }}
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