import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import CodingChallengeCard from "../../components/cards/CodingChallengeCard";
import ImageChallengeCard from "../../components/cards/ImageChallengeCard";
import {
  getPsSharesPublic,
  getImgSharesPublic,
  getVideoSharesPublic,
  getPsChallengesPublic,
  getImgChallengesPublic,
  getVideoChallengesPublic,
  getChallengeDetails,
} from "../../apis/api";
import { convertImagePathToUrl } from "../../utils/imageUrlHelper";
import "./MainPage.css";

const MainPage = () => {
  const navigate = useNavigate();
  const [topChallenges, setTopChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [challengeImages, setChallengeImages] = useState({});

  // 성능 최적화된 챌린지 데이터 가져오기 함수
  const fetchTopChallengesByCategory = async () => {
    try {
      setLoading(true);

      const categories = [
        { api: "ps", category: "코딩", isImageChallenge: false, isVideoChallenge: false },
        { api: "img", category: "그림", isImageChallenge: true, isVideoChallenge: false },
        { api: "video", category: "영상", isImageChallenge: false, isVideoChallenge: true },
      ];

      // 🚀 성능 개선: 모든 API를 병렬로 호출
      const apiCalls = categories.map(async (categoryInfo) => {
        try {
          // 병렬로 shares와 challenges 데이터 동시 호출
          const [sharesResult, challengesResult] = await Promise.all([
            categoryInfo.api === "ps" ? getPsSharesPublic({ limit: 50 }) :
            categoryInfo.api === "img" ? getImgSharesPublic({ limit: 50 }) :
            getVideoSharesPublic({ limit: 50 }),
            
            categoryInfo.api === "ps" ? getPsChallengesPublic({ limit: 50 }) :
            categoryInfo.api === "img" ? getImgChallengesPublic({ limit: 50 }) :
            getVideoChallengesPublic({ limit: 50 })
          ]);

          if (!sharesResult?.success || !challengesResult?.success || 
              !sharesResult.data?.length || !challengesResult.data?.length) {
            return null;
          }

          // shares 개수 계산 최적화
          const challengeSharesCount = {};
          sharesResult.data.forEach(share => {
            if (share.challenge_id) {
              challengeSharesCount[share.challenge_id] = 
                (challengeSharesCount[share.challenge_id] || 0) + 1;
            }
          });

          // 가장 인기 있는 챌린지 찾기
          let topChallengeId = null;
          let maxShares = 0;
          Object.entries(challengeSharesCount).forEach(([challengeId, count]) => {
            if (count > maxShares) {
              maxShares = count;
              topChallengeId = parseInt(challengeId);
            }
          });

          if (!topChallengeId || maxShares === 0) return null;

          // 챌린지 상세 정보 찾기 (이미 가져온 데이터에서 찾음)
          const challengeDetails = challengesResult.data.find(
            challenge => challenge.id === topChallengeId
          );

          if (!challengeDetails) return null;

          // 공통 데이터 변환 로직
          const getDifficulty = (level) => {
            switch (level) {
              case "Easy": return "초급";
              case "Medium": return "중급"; 
              case "Hard": return "고급";
              default: return "중급";
            }
          };

          return {
            id: topChallengeId,
            title: challengeDetails.title || `Challenge #${topChallengeId}`,
            description: challengeDetails.content || "설명이 없습니다.",
            difficulty: getDifficulty(challengeDetails.level),
            category: categoryInfo.category,
            shares: maxShares,
            isImageChallenge: categoryInfo.isImageChallenge,
            isVideoChallenge: categoryInfo.isVideoChallenge,
          };

        } catch (categoryError) {
          console.warn(`${categoryInfo.api} 카테고리 처리 실패:`, categoryError);
          return null;
        }
      });

      // 모든 카테고리 병렬 처리 완료 대기
      const results = await Promise.all(apiCalls);
      const topChallengesData = results.filter(result => result !== null);

      // 데이터가 없으면 임시 데이터 사용
      if (topChallengesData.length === 0) {
        console.log("API 데이터가 없어서 임시 데이터를 사용합니다.");
        const fallbackData = [
          {
            id: 201,
            title: "알파벳 대문자 문자열 변환",
            description: "주어진 문자열에서 알파벳 대문자만 추출하여 새로운 문자열을 만드는 문제입니다.",
            difficulty: "중급",
            category: "코딩",
            shares: 12,
            isImageChallenge: false,
            isVideoChallenge: false,
          },
          {
            id: 5,
            title: "사실적인 고양이",
            description: "털이 부드럽고 눈이 반짝이는 사실적인 고양이를 그려보세요.",
            difficulty: "고급",
            category: "그림",
            shares: 8,
            isImageChallenge: true,
            isVideoChallenge: false,
          },
          {
            id: 3,
            title: "바다 풍경",
            description: "파도가 치는 아름다운 바다 풍경을 만들어보세요.",
            difficulty: "중급",
            category: "영상",
            shares: 6,
            isImageChallenge: false,
            isVideoChallenge: true,
          }
        ];
        setTopChallenges(fallbackData);
      } else {
        setTopChallenges(topChallengesData);
      }
      
    } catch (error) {
      console.error("Top challenges 가져오기 실패:", error);
      console.log("에러로 인해 임시 데이터를 사용합니다.");
      
      // 에러 시에도 임시 데이터 제공
      const fallbackData = [
        {
          id: 201,
          title: "알파벳 대문자 문자열 변환",
          description: "주어진 문자열에서 알파벳 대문자만 추출하여 새로운 문자열을 만드는 문제입니다.",
          difficulty: "중급",
          category: "코딩",
          shares: 12,
          isImageChallenge: false,
          isVideoChallenge: false,
        },
        {
          id: 5,
          title: "사실적인 고양이",
          description: "털이 부드럽고 눈이 반짝이는 사실적인 고양이를 그려보세요.",
          difficulty: "고급",
          category: "그림",
          shares: 8,
          isImageChallenge: true,
          isVideoChallenge: false,
        },
        {
          id: 3,
          title: "바다 풍경",
          description: "파도가 치는 아름다운 바다 풍경을 만들어보세요.",
          difficulty: "중급",
          category: "영상",
          shares: 6,
          isImageChallenge: false,
          isVideoChallenge: true,
        }
      ];
      setTopChallenges(fallbackData);
      setError(null); // 에러 메시지 제거 (임시 데이터로 대체)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopChallengesByCategory();
  }, []);

  // 이미지/영상 챌린지의 미디어 가져오기
  useEffect(() => {
    const fetchChallengeImages = async () => {
      if (topChallenges.length === 0) return;

      const imageMap = {};

      for (const challenge of topChallenges) {
        if (challenge.isImageChallenge || challenge.isVideoChallenge) {
          try {
            // 1. 먼저 챌린지 상세 정보에서 reference image 가져오기
            const challengeDetails = await getChallengeDetails(challenge.id);
            
            if (challengeDetails.success) {
              const details = challengeDetails.data;
              let referenceUrl = null;
              
              if (challenge.isImageChallenge && details.img_challenge?.references?.length > 0) {
                const reference = details.img_challenge.references[0];
                if (reference.file_path) {
                  referenceUrl = convertImagePathToUrl(reference.file_path);
                  console.log(`Challenge ${challenge.id} reference image:`, referenceUrl);
                }
              } else if (challenge.isVideoChallenge && details.video_challenge?.references?.length > 0) {
                const reference = details.video_challenge.references[0];
                if (reference.file_path) {
                  referenceUrl = convertImagePathToUrl(reference.file_path);
                  console.log(`Challenge ${challenge.id} reference video:`, referenceUrl);
                }
              }
              
              if (referenceUrl) {
                imageMap[challenge.id] = referenceUrl;
                continue; // reference image가 있으면 share image 가져올 필요 없음
              }
            }

            // 2. reference image가 없으면 인기 있는 share image 가져오기
            let shareEndpoint = '';
            if (challenge.isImageChallenge) {
              shareEndpoint = `/api/shares/img/?challenge_id=${challenge.id}&limit=10`;
            } else if (challenge.isVideoChallenge) {
              shareEndpoint = `/api/shares/video/?challenge_id=${challenge.id}&limit=10`;
            }

            if (shareEndpoint) {
              const response = await fetch(shareEndpoint);
              if (response.ok) {
                const shares = await response.json();
                if (shares && shares.length > 0) {
                  // 좋아요가 가장 많은 미디어 찾기
                  const sortedShares = shares.sort((a, b) => {
                    const likesA = (a.likes || []).length;
                    const likesB = (b.likes || []).length;
                    return likesB - likesA;
                  });

                  const mostLikedShare = sortedShares[0];
                  let mediaUrl = null;

                  if (challenge.isImageChallenge) {
                    mediaUrl = mostLikedShare.img_share?.img_url || 
                              mostLikedShare.img_url || 
                              mostLikedShare.image || 
                              mostLikedShare.img;
                  } else if (challenge.isVideoChallenge) {
                    mediaUrl = mostLikedShare.video_share?.video_url || 
                              mostLikedShare.video_url || 
                              mostLikedShare.video;
                  }

                  if (mediaUrl) {
                    const convertedUrl = convertImagePathToUrl(mediaUrl);
                    imageMap[challenge.id] = convertedUrl;
                    console.log(`Challenge ${challenge.id} share media:`, convertedUrl);
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Failed to fetch media for challenge ${challenge.id}:`, error);
          }
        }
      }

      setChallengeImages(imageMap);
    };

    fetchChallengeImages();
  }, [topChallenges]);

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
                      imageUrl={challengeImages[challenge.id]} // 실제 이미지 URL 전달
                      onClick={handleChallengeClick}
                    />
                  ) : challenge.isVideoChallenge ? (
                    <ImageChallengeCard
                      challenge={challenge}
                      imageUrl={challengeImages[challenge.id]} // 실제 비디오 URL 전달
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
