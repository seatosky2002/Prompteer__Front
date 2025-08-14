import React from "react";
import Header from "../../components/common/Header/index.jsx";
import MypageQuestionCard from "../../components/cards/MypageQuestionCard/index.jsx";
import MypageCodingCard from "../../components/cards/MypageCodingCard/index.jsx";
import MypageImageCard from "../../components/cards/MypageImageCard/index.jsx";
import Footer from "../../components/common/Footer/index.jsx";
import "./MyPage.css";

const MyPage = () => {
  // 샘플 데이터
  const questions = [
    {
      id: 1,
      question: "왜 틀렸는지 잘 모르겠습니다.",
      category: "코딩",
      likes: 13,
      author: "뽀복",
      views: 3,
      date: "25/7/27",
    },
    {
      id: 2,
      question: "왜 틀렸는지 잘 모르겠습니다.",
      category: "코딩",
      likes: 13,
      author: "뽀복",
      views: 3,
      date: "25/7/27",
    },
    {
      id: 3,
      question: "왜 틀렸는지 잘 모르겠습니다.",
      category: "코딩",
      likes: 13,
      author: "뽀복",
      views: 3,
      date: "25/7/27",
    },
  ];

  // 피그마 디자인에 맞춰 18개의 코딩 챌린지 (6x3 그리드)
  const codingChallenges = Array(18)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      challengeNumber: 12,
      title: "BFS 알고리즘",
      description:
        "알고리즘은 뭐라고 해야할지 모르겠어서 그냥 아무말이나 적을게요:) 컴공과 부탁해요~",
      difficulty: "고급",
    }));

  // 피그마 디자인에 맞춰 12개의 이미지/영상 챌린지 (6x2 그리드)
  // 내가 만든 더미 데이터
  const imageChallenges = [
    {
      id: 1,
      challengeNumber: 11,
      title: "일상 풍경 묘사 프롬프트 만들기",
      type: "이미지",
      difficulty: "초급",
    },
    {
      id: 2,
      challengeNumber: 12,
      title: "사실적인 물거품",
      type: "이미지",
      difficulty: "고급",
    },
    {
      id: 3,
      challengeNumber: 13,
      title: "뽀송뽀송한 아기 양",
      type: "이미지",
      difficulty: "초급",
    },
    {
      id: 4,
      challengeNumber: 14,
      title: "바다 옆 철길을 달리는 사실적인 기차",
      type: "영상",
      difficulty: "초급",
    },
    {
      id: 5,
      challengeNumber: 15,
      title: "꿀이 흐르고 보석들이 흩어져있는 핫케이크",
      type: "이미지",
      difficulty: "중급",
    },
    {
      id: 6,
      challengeNumber: 16,
      title: "숲속에서 뒤를 돌아보는 흰색 요정 소녀",
      type: "영상",
      difficulty: "고급",
    },
    {
      id: 7,
      challengeNumber: 11,
      title: "일상 풍경 묘사 프롬프트 만들기",
      type: "이미지",
      difficulty: "초급",
    },
    {
      id: 8,
      challengeNumber: 12,
      title: "사실적인 물거품",
      type: "이미지",
      difficulty: "고급",
    },
    {
      id: 9,
      challengeNumber: 13,
      title: "뽀송뽀송한 아기 양",
      type: "이미지",
      difficulty: "초급",
    },
    {
      id: 10,
      challengeNumber: 14,
      title: "바다 옆 철길을 달리는 사실적인 기차",
      type: "영상",
      difficulty: "초급",
    },
    {
      id: 11,
      challengeNumber: 15,
      title: "꿀이 흐르고 보석들이 흩어져있는 핫케이크",
      type: "이미지",
      difficulty: "중급",
    },
    {
      id: 12,
      challengeNumber: 16,
      title: "숲속에서 뒤를 돌아보는 흰색 요정 소녀",
      type: "영상",
      difficulty: "고급",
    },
  ];

  return (
    <div className="my-page">
      <Header />
      <main className="main-content">
        <div className="content-container">
          <section className="page-section">
            <div className="section-background">
              <div className="section-header">
                <div className="page-title-section">
                  <h1 className="page-title">마이 페이지</h1>
                </div>
                <div className="page-description">
                  <p>
                    지금까지 올린 질문과 풀어낸 문제들을 볼 수 있고, 클릭하면
                    세부 질문 및 본인의 프롬프트와 좋아요를 확인할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="content-sections">
                {/* 내가 올린 질문 섹션 */}
                <div className="content-section">
                  <div className="section-label">
                    <h2 className="section-title">내가 올린 질문</h2>
                  </div>
                  <div className="questions-list">
                    {questions.map((question) => (
                      <MypageQuestionCard key={question.id} {...question} />
                    ))}
                  </div>
                </div>

                {/* 코딩 챌린지 섹션 */}
                <div className="content-section">
                  <div className="section-label">
                    <h2 className="section-title">참여한 코딩 챌린지 목록</h2>
                  </div>
                  <div className="coding-grid">
                    <div className="coding-grid-container">
                      {codingChallenges.map((challenge) => (
                        <MypageCodingCard key={challenge.id} {...challenge} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 이미지/영상 챌린지 섹션 */}
                <div className="content-section">
                  <div className="section-label">
                    <h2 className="section-title">
                      참여한 이미지/영상 챌린지 목록
                    </h2>
                  </div>
                  <div className="image-grid">
                    {imageChallenges.map((challenge) => (
                      <MypageImageCard
                        key={challenge.id}
                        challengeId={challenge.id}
                        title={`Challenge #${challenge.challengeNumber}`}
                        description={challenge.title}
                        type={challenge.type}
                        difficulty={challenge.difficulty}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyPage;
