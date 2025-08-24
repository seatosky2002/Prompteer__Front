import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import CodingChallengeCard from "../../components/cards/CodingChallengeCard";
import ImageChallengeCard from "../../components/cards/ImageChallengeCard";
import {
  getPsShares,
  getImgShares,
  getVideoShares,
  getPsChallenges,
  getImgChallenges,
  getVideoChallenges,
} from "../../apis/api";
import "./MainPage.css";

const MainPage = () => {
  const navigate = useNavigate();
  const [topChallenges, setTopChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 각 카테고리별로 shares가 가장 많은 문제를 가져오는 함수
  const fetchTopChallengesByCategory = async () => {
    try {
      setLoading(true);

      // 각 카테고리별로 shares API를 호출하여 challenge_id별 shares 개수를 계산
      const categories = [
        {
          api: "ps",
          category: "코딩",
          isImageChallenge: false,
          isVideoChallenge: false,
        },
        {
          api: "img",
          category: "그림",
          isImageChallenge: true,
          isVideoChallenge: false,
        },
        {
          api: "video",
          category: "영상",
          isImageChallenge: false,
          isVideoChallenge: true,
        },
      ];

      const topChallengesData = [];

      for (const categoryInfo of categories) {
        // ps, img, video 별로 각각 수행
        try {
          // 각 카테고리별 shares API 호출
          let sharesResult;

          if (categoryInfo.api === "ps") {
            sharesResult = await getPsShares({ limit: 100 }); // limit 그냥 디폴트 100개로 수행..
          } else if (categoryInfo.api === "img") {
            sharesResult = await getImgShares({ limit: 100 });
          } else if (categoryInfo.api === "video") {
            sharesResult = await getVideoShares({ limit: 100 });
          }

          if (sharesResult && sharesResult.success) {
            const sharesData = sharesResult.data;

            if (sharesData && sharesData.length > 0) {
              // shares 전체 데이터를 뽑아와서, challenge_id별로 shares 개수 계산
              const challengeSharesCount = {}; // 배열로 정의

              sharesData.forEach((share) => {
                const challengeId = share.challenge_id;
                if (challengeId) {
                  challengeSharesCount[challengeId] =
                    (challengeSharesCount[challengeId] || 0) + 1;
                }
              });

              // shares가 가장 많은 challenge_id 찾기
              // challengeSharesCount에서 최댓값 찾기
              let topChallengeId = null;
              let maxShares = 0;

              Object.entries(challengeSharesCount).forEach(
                ([challengeId, sharesCount]) => {
                  if (sharesCount > maxShares) {
                    maxShares = sharesCount;
                    topChallengeId = parseInt(challengeId);
                  }
                }
              );

              if (topChallengeId && maxShares > 0) {
                // 해당 챌린지의 상세 정보를 가져오기 위해 챌린지 목록 API 호출
                let challengeDetails = null;

                if (categoryInfo.api === "ps") {
                  // PS 챌린지 목록에서 topChallengeId에 해당하는 챌린지 찾기.
                  // 전체 PS 챌린지 목록에서 필터링하는거라.. 코드 효율화 무조건 필요
                  const challengesResult = await getPsChallenges({
                    limit: 100,
                  });
                  if (challengesResult && challengesResult.success) {
                    challengeDetails = challengesResult.data.find(
                      (challenge) => challenge.id === topChallengeId
                    ); // 필터링
                  }
                } else if (categoryInfo.api === "img") {
                  // 이미지 챌린지 목록에서 topChallengeId에 해당하는 챌린지 찾기
                  const challengesResult = await getImgChallenges({
                    limit: 100,
                  });
                  if (challengesResult && challengesResult.success) {
                    challengeDetails = challengesResult.data.find(
                      (challenge) => challenge.id === topChallengeId
                    );
                  }
                } else if (categoryInfo.api === "video") {
                  // 비디오 챌린지 목록에서 topChallengeId에 해당하는 챌린지 찾기
                  const challengesResult = await getVideoChallenges({
                    limit: 100,
                  });
                  if (challengesResult && challengesResult.success) {
                    challengeDetails = challengesResult.data.find(
                      (challenge) => challenge.id === topChallengeId
                    );
                  }
                }

                // 카테고리별로 데이터 구조 변환
                if (categoryInfo.api === "ps") {
                  topChallengesData.push({
                    // 이것도 배열로 정의. 데이터 배열 자체를 topChallengesData라는 배열에 추가하는 것.
                    id: topChallengeId,
                    title: challengeDetails?.title,
                    description: challengeDetails?.content,
                    difficulty:
                      challengeDetails?.level === "Easy"
                        ? "초급"
                        : challengeDetails?.level === "Medium"
                        ? "중급"
                        : challengeDetails?.level === "Hard"
                        ? "고급"
                        : "None",

                    category: categoryInfo.category,
                    shares: maxShares,
                  });
                } else if (categoryInfo.api === "img") {
                  topChallengesData.push({
                    id: topChallengeId,
                    title: challengeDetails?.title,
                    description: challengeDetails?.content,
                    difficulty:
                      challengeDetails?.level === "Easy"
                        ? "초급"
                        : challengeDetails?.level === "Medium"
                        ? "중급"
                        : challengeDetails?.level === "Hard"
                        ? "고급"
                        : "None",

                    category: categoryInfo.category,
                    shares: maxShares,
                    isImageChallenge: true,
                  });
                } else if (categoryInfo.api === "video") {
                  topChallengesData.push({
                    id: topChallengeId,
                    title: challengeDetails?.title,
                    description: challengeDetails?.content,
                    difficulty:
                      challengeDetails?.level === "Easy"
                        ? "초급"
                        : challengeDetails?.level === "Medium"
                        ? "중급"
                        : challengeDetails?.level === "Hard"
                        ? "고급"
                        : "None",

                    category: categoryInfo.category,
                    shares: maxShares,
                    isVideoChallenge: true,
                  });
                }
              }
            }
          }
        } catch (categoryError) {
          console.warn(
            `${categoryInfo.api} 카테고리 데이터 가져오기 실패:`,
            categoryError
          );
          // 에러가 발생해도 다른 카테고리는 계속 시도
        }
      }

      // ps, img, video 전체에 대해서도 shares 기준으로 정렬 (내림차순)
      // topChallengesData.sort((a, b) => (b.shares || 0) - (a.shares || 0));

      setTopChallenges(topChallengesData);
    } catch (error) {
      console.error("Top challenges 가져오기 실패:", error);
      setError("인기 챌린지를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopChallengesByCategory();
  }, []);

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

  /*
// 하드코딩한 Top Challenges
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
*/
  const handleChallengeClick = (challenge) => {
    if (challenge.category === "코딩") {
      navigate(`/coding/problem/${challenge.id}`);
    } else if (challenge.category === "그림") {
      navigate(`/image/challenge/${challenge.id}`);
    } else if (challenge.category === "영상") {
      navigate(`/video/challenge/${challenge.id}`);
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
            <p className="section-description">인기있는 문제들을 모아봤어요</p>
          </div>

          <div className="main-page-challenges-grid">
            {loading ? (
              <p className="loading-message">Loading challenges...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              topChallenges.map((challenge, index) => (
                <div key={index} className="challenge-wrapper">
                  {challenge.isImageChallenge ? (
                    <ImageChallengeCard
                      challenge={challenge} // 해당하는 챌린지를 컴포넌트에 넘기기
                      imageUrl={null} // MainPage에서는 이미지 URL을 제공하지 않음
                      onClick={handleChallengeClick}
                    />
                  ) : challenge.isVideoChallenge ? (
                    <ImageChallengeCard
                      challenge={challenge}
                      imageUrl={null} // MainPage에서는 이미지 URL을 제공하지 않음
                      onClick={handleChallengeClick}
                    />
                  ) : (
                    <CodingChallengeCard
                      challenge={challenge}
                      onClick={handleChallengeClick}
                    />
                  )}
                </div>
              ))
            )}
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
