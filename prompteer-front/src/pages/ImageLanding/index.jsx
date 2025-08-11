import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import './ImageLanding.css';

const ImageLanding = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('이미지');

  // 챌린지 데이터
  const challenges = [
    {
      id: 14,
      type: '영상',
      title: 'Challenge #14',
      description: '바다 옆 철길을 달리는 사실적인 기차',
      difficulty: '초급',
      difficultyColor: '#64BE75',
      image: 'challenge14.jpg'
    },
    {
      id: 11,
      type: '이미지',
      title: 'Challenge #11',
      description: '일상 풍경 묘사 프롬프트 만들기',
      difficulty: '초급',
      difficultyColor: '#64BE75',
      image: 'challenge11.jpg'
    },
    {
      id: 12,
      type: '이미지',
      title: 'Challenge #12',
      description: '사실적인 물거품',
      difficulty: '고급',
      difficultyColor: '#FF6A6A',
      image: 'challenge12.jpg'
    },
    {
      id: 13,
      type: '이미지',
      title: 'Challenge #13',
      description: '뽀송뽀송한 아기 양',
      difficulty: '초급',
      difficultyColor: '#64BE75',
      image: 'challenge13.jpg'
    },
    {
      id: 16,
      type: '영상',
      title: 'Challenge #16',
      description: '숲속에서 뒤를 돌아보는 흰색 요정 소녀',
      difficulty: '고급',
      difficultyColor: '#FF6A6A',
      image: 'challenge16.jpg'
    },
    {
      id: 15,
      type: '이미지',
      title: 'Challenge #15',
      description: '꿀이 흐르고 보석들이 흩어져있는 핫케이크',
      difficulty: '중급',
      difficultyColor: '#FF9E42',
      image: 'challenge15.jpg'
    }
  ];

  const handleChallengeClick = (challengeId) => {
    navigate(`/image/challenge/${challengeId}`);
  };

  const handleTryNow = () => {
    navigate('/image/challenge/11');
  };

  const filteredChallenges = challenges.filter(challenge => 
    activeFilter === '전체' || challenge.type === activeFilter
  );

  return (
    <div className="image-landing-page">
      <Header />
      
      <main className="image-landing-main">
        <div className="image-landing-container">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-card">
              <div className="hero-content">
                <h1 className="hero-title">그림 / 영상 카테고리</h1>
                <div className="hero-challenge-info">
                  <div className="hero-badge">
                    <span className="badge-text">doing</span>
                  </div>
                  <div className="hero-text-content">
                    <h2 className="hero-challenge-title">Challenge #11</h2>
                    <p className="hero-challenge-desc">일상 풍경 묘사 프롬프트 만들기</p>
                  </div>
                  <button className="hero-try-btn" onClick={handleTryNow}>
                    지금 도전하기 →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Search and Filter Section */}
          <section className="search-filter-section">
            <div className="search-container">
              <div className="search-box">
                <div className="search-input">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M19 19L13 13L19 19ZM15 8C15 11.866 11.866 15 8 15C4.134 15 1 11.866 1 8C1 4.134 4.134 1 8 1C11.866 1 15 4.134 15 8Z" stroke="#CED4DA" strokeWidth="1"/>
                  </svg>
                </div>
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${activeFilter === '이미지' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('이미지')}
                  >
                    이미지
                  </button>
                  <button 
                    className={`filter-btn ${activeFilter === '영상' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('영상')}
                  >
                    영상
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Challenges Grid Section */}
          <section className="challenges-section">
            <div className="challenges-grid">
              {filteredChallenges.map((challenge) => (
                <div 
                  key={challenge.id} 
                  className="challenge-card"
                  data-challenge={challenge.id}
                  onClick={() => handleChallengeClick(challenge.id)}
                >
                  <div className="challenge-image">
                    <div className="challenge-type-badge">
                      <span className="type-text">{challenge.type}</span>
                    </div>
                  </div>
                  <div className="challenge-info">
                    <div className="challenge-text">
                      <h3 className="challenge-title">{challenge.title}</h3>
                      <p className="challenge-description">{challenge.description}</p>
                    </div>
                    <div className="challenge-difficulty">
                      <span 
                        className="difficulty-badge"
                        style={{ backgroundColor: challenge.difficultyColor }}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ImageLanding;