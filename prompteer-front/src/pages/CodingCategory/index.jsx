import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import './CodingCategory.css';

const CodingCategory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('difficulty'); // 'difficulty' or 'latest'

  // 샘플 코딩 챌린지 데이터 (9개로 수정)
  const challenges = [
    {
      id: 1,
      title: 'Challenge #12\nBFS 알고리즘',
      description: '알고리즘은 뭐라고 해야할지 모르겠어서 그냥 아무말이나 적을게요:) 컴공과 부탁해요~',
      difficulty: '고급',
      participants: 1043,
      category: '코딩',
      createdAt: '2025-01-01'
    },
    {
      id: 2,
      title: 'Challenge #13\n그래프 탐색',
      description: 'DFS와 BFS를 활용한 그래프 탐색 문제입니다. 다양한 접근 방법을 시도해보세요!',
      difficulty: '중급',
      participants: 892,
      category: '코딩',
      createdAt: '2025-01-02'
    },
    {
      id: 3,
      title: 'Challenge #14\n동적 계획법',
      description: '메모이제이션을 활용한 최적화 문제를 해결해보세요. 효율적인 알고리즘이 핵심입니다.',
      difficulty: '고급',
      participants: 756,
      category: '코딩',
      createdAt: '2025-01-03'
    },
    {
      id: 4,
      title: 'Challenge #15\n이진 탐색',
      description: '정렬된 배열에서 효율적으로 원소를 찾는 이진 탐색 알고리즘을 구현해보세요.',
      difficulty: '초급',
      participants: 1205,
      category: '코딩',
      createdAt: '2025-01-04'
    },
    {
      id: 5,
      title: 'Challenge #16\n트리 순회',
      description: '전위, 중위, 후위 순회를 모두 구현하고 각각의 특징을 파악해보세요.',
      difficulty: '중급',
      participants: 623,
      category: '코딩',
      createdAt: '2025-01-05'
    },
    {
      id: 6,
      title: 'Challenge #17\n정렬 알고리즘',
      description: '다양한 정렬 알고리즘의 시간복잡도를 비교하고 최적의 방법을 선택해보세요.',
      difficulty: '초급',
      participants: 987,
      category: '코딩',
      createdAt: '2025-01-06'
    },
    {
      id: 7,
      title: 'Challenge #18\n해시 테이블',
      description: '해시 함수를 설계하고 충돌 처리 방법을 구현해보는 고급 문제입니다.',
      difficulty: '고급',
      participants: 445,
      category: '코딩',
      createdAt: '2025-01-07'
    },
    {
      id: 8,
      title: 'Challenge #19\n백트래킹',
      description: 'N-Queen 문제를 백트래킹으로 해결해보세요. 최적화 기법도 함께 적용해보면 좋습니다.',
      difficulty: '고급',
      participants: 334,
      category: '코딩',
      createdAt: '2025-01-08'
    },
    {
      id: 9,
      title: 'Challenge #20\n스택과 큐',
      description: '스택과 큐의 기본 연산을 구현하고 실제 문제에 적용해보세요.',
      difficulty: '초급',
      participants: 1456,
      category: '코딩',
      createdAt: '2025-01-09'
    }
  ];

  // 필터링 및 정렬
  const getFilteredAndSortedChallenges = () => {
    let filtered = challenges;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    if (sortBy === 'difficulty') {
      const difficultyOrder = { '초급': 1, '중급': 2, '고급': 3 };
      filtered.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
    } else if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  };

  const handleChallengeClick = (challengeId) => {
    navigate(`/coding/problem/${challengeId}`);
  };

  const handleChallengeNow = () => {
    // Featured 챌린지 #12로 이동
    navigate('/coding/problem/12');
  };

  return (
    <div className="coding-category-page">
      <Header />

      {/* Main Content */}
      <main className="coding-main">
        {/* Featured Section */}
        <div className="featured-section">
          <div className="featured-content">
            <h2 className="featured-title">코딩 카테고리</h2>
            <div className="featured-details">
              <div className="status-badge">doing</div>
              <div className="featured-info">
                <h3 className="challenge-number">Challenge #12</h3>
                <p className="challenge-name">BFS 알골리즘</p>
              </div>
              <button className="challenge-now-btn" onClick={handleChallengeNow}>
                지금 도전하기 →
              </button>
            </div>
          </div>
        </div>

        {/* Body Container - Figma: body_container */}
        <div className="body-container">
          {/* Search Container - Figma: 검색창 외부 */}
          <div className="search-outer-container">
            {/* Search Inner - Figma: 검색창 내부 */}
            <div className="search-inner-container">
              {/* Search Box - Figma: 검색창 */}
              <div className="search-box">
                <div className="search-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                      stroke="#CED4DA"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              {/* Filter Frame - Figma: Frame 106 */}
              <div className="filter-frame">
                <button
                  className={`filter-btn ${sortBy === 'difficulty' ? 'active' : ''}`}
                  onClick={() => setSortBy('difficulty')}
                >
                  난이도순
                </button>
                <button
                  className={`filter-btn ${sortBy === 'latest' ? 'active' : ''}`}
                  onClick={() => setSortBy('latest')}
                >
                  최신순
                </button>
              </div>
            </div>
          </div>

          {/* Challenges Grid Container - Figma: Frame 283 */}
          <div className="frame-283">
            {getFilteredAndSortedChallenges().map((challenge) => (
              <div
                key={challenge.id}
                className="challenge-card"
                onClick={() => handleChallengeClick(challenge.id)}
              >
                {/* Frame 127 */}
                <div className="frame-127">
                  {/* Frame 22 */}
                  <div className="frame-22">
                    <h3 className="challenge-title">
                      {challenge.title}
                    </h3>
                  </div>
                  {/* Frame 21 - Category Badge */}
                  <div className="frame-21">
                    <span className="category-text">{challenge.category}</span>
                  </div>
                </div>
                
                {/* Frame 23 - Description */}
                <div className="frame-23">
                  <div className="frame-24">
                    <p className="challenge-description-text">{challenge.description}</p>
                  </div>
                </div>
                
                {/* Frame 25 - Difficulty */}
                <div className="frame-25">
                  <div className="frame-26">
                    <div className={`frame-28 difficulty-${challenge.difficulty}`}>
                      <span className="difficulty-text">{challenge.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                {/* Frame 29 - Participants */}
                <div className="frame-29">
                  <div className="frame-33">
                    <span className="participants-text">🧑 {challenge.participants}명 참가 중</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {getFilteredAndSortedChallenges().length === 0 && (
          <div className="no-results">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CodingCategory;