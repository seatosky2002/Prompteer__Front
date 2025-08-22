import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import ChallengeCard from "../../components/cards/ChallengeCard";
import "./MainPage.css";

const MainPage = () => {
  const navigate = useNavigate();

  const topChallenges = [
    {
      challengeId: 12,
      title: "Challenge #12\nn번째 숫자 찾기",
      description:
        "수학과인 영진이는 연속하는 수를 좋아한다. 영진이는 아래와 같이 두 가지 수를 정의하였다...",
      difficulty: "고급",
      participants: 1043,
      category: "코딩",
    },
    {
      challengeId: 28,
      title: "Challenge #28\n스네이크 게임",
      description:
        "알고리즘 원툴 상원이는 첫 프로젝트를 시작했다. 바로 스네이크 게임을 만드는 것이다. 게임에 자신만의 시그니처를 넣고 싶었던 상원이는...",
      difficulty: "고급",
      participants: 1043,
      category: "코딩",
    },
    {
      challengeId: 12,
      title: "Challenge #12",
      description: "사실적인 물거품",
      difficulty: "고급",
      participants: 1043,
      category: "그림",
      isImageChallenge: true,
    },
  ];

  const categories = [
    {
      id: "algorithm",
      title: "Algorithm",
      subtitle: "Challenge",
      icon: "neural",
      path: "/category/coding",
    },
    {
      id: "video-image",
      title: "Video/Image",
      subtitle: "Challenge",
      icon: "image",
      path: "/category/image",
    },
    {
      id: "jailbreak",
      title: "Jail Break",
      subtitle: "Challenge",
      icon: "prison",
      path: "/category/jailbreak",
    },
    {
      id: "documentation",
      title: "Documentation",
      subtitle: "Challenge",
      icon: "docs",
      path: "/category/documentation",
    },
  ];

  const handleChallengeClick = (challenge) => {
    if (challenge.category === "코딩") {
      navigate(`/coding/problem/${challenge.challengeId}`);
    } else if (challenge.category === "그림") {
      navigate(`/image/challenge/${challenge.challengeId}`);
    }
  };

  const handleCategoryClick = (category) => {
    if (category.id === "algorithm") {
      navigate(category.path);
    } else if (category.id === "video-image") {
      navigate(category.path);
    } else {
      navigate("/category/preparing");
    }
  };

  return (
    <div className="main-page">
      <Header />

      <main className="main-content">
        {/* Top Challenges Section */}
        <section className="top-challenges-section">
          <div className="section-header">
            <h1 className="section-title">Top Challenges</h1>
            <p className="section-description">
              전체 문제 중 좋아요 수가 가장 많은 문제들
            </p>
          </div>

          <div className="main-page-challenges-grid">
            {topChallenges.map((challenge, index) => (
              <div key={index} className="challenge-wrapper">
                {challenge.isImageChallenge ? (
                  <div
                    className="image-challenge-card"
                    onClick={() => handleChallengeClick(challenge)}
                  >
                    <div className="image-challenge-content">
                      <div className="image-placeholder">
                        <div className="category-badge image-category">
                          이미지
                        </div>
                      </div>
                      <div className="image-challenge-info">
                        <h3 className="image-challenge-title">
                          {challenge.title}
                        </h3>
                        <p className="image-challenge-description">
                          {challenge.description}
                        </p>
                        <div className="image-challenge-meta">
                          <span className="difficulty-badge difficulty-advanced">
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ChallengeCard
                    challengeId={challenge.challengeId}
                    title={challenge.title}
                    description={challenge.description}
                    difficulty={challenge.difficulty}
                    participants={challenge.participants}
                    category={challenge.category}
                    onClick={() => handleChallengeClick(challenge)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Challenge Categories Section */}
        <section className="categories-section">
          <div className="section-header">
            <h1 className="section-title">Challenge Category</h1>
          </div>

          <div className="categories-grid">
            <div className="categories-row">
              {categories.slice(0, 2).map((category) => (
                <div
                  key={category.id}
                  className="category-card"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="category-icon">
                    <div className={`icon-${category.icon}`}></div>
                  </div>
                  <div className="category-content">
                    <h2 className="category-title">{category.title}</h2>
                    <p className="category-subtitle">{category.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="categories-row">
              {categories.slice(2, 4).map((category) => (
                <div
                  key={category.id}
                  className="category-card"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="category-icon">
                    <div className={`icon-${category.icon}`}></div>
                  </div>
                  <div className="category-content">
                    <h2 className="category-title">{category.title}</h2>
                    <p className="category-subtitle">{category.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MainPage;
