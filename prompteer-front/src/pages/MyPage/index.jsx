import React, { useState } from "react";
import Header from "../../components/common/Header/index.jsx";
import MypageQuestionCard from "../../components/cards/MypageQuestionCard/index.jsx";
import MypageCodingCard from "../../components/cards/MypageCodingCard/index.jsx";
import MypageImageCard from "../../components/cards/MypageImageCard/index.jsx";
import Footer from "../../components/common/Footer/index.jsx";
import "./MyPage.css";

const MyPage = () => {
  const [activeTab, setActiveTab] = useState("내가 올린 질문");

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

  const tabs = [
    { id: "내가 올린 질문", label: "내가 올린 질문", icon: "❓" },
    { id: "코딩 챌린지", label: "코딩 챌린지", icon: "💻" },
    { id: "이미지/영상 챌린지", label: "이미지/영상 챌린지", icon: "🖼️" },
  ];

  const renderActiveContent = () => {
    switch (activeTab) {
      case "내가 올린 질문":
        return (
          <div className="mypage-content-section">
            <h2 className="section-title">내가 올린 질문</h2>
            <div className="questions-list">
              {questions.map((question) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <h3 className="question-title">{question.question}</h3>
                    <span className="category-tag">{question.category}</span>
                  </div>
                  <div className="question-stats">
                    <div className="stat-item">
                      <span className="stat-label">좋아요</span>
                      <span className="stat-value">{question.likes}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">작성자</span>
                      <span className="stat-value">{question.author}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">조회수</span>
                      <span className="stat-value">{question.views}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">날짜</span>
                      <span className="stat-value">{question.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "코딩 챌린지":
        return (
          <div className="mypage-content-section">
            <h2 className="section-title">참여한 코딩 챌린지 목록</h2>
            <div className="coding-section">
              <div className="coding-grid">
                {codingChallenges.map((challenge) => (
                  <MypageCodingCard key={challenge.id} {...challenge} />
                ))}
              </div>
            </div>
          </div>
        );

      case "이미지/영상 챌린지":
        return (
          <div className="mypage-content-section">
            <h2 className="section-title">참여한 이미지/영상 챌린지 목록</h2>
            <div className="image-section">
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
        );

      default:
        return (
          <div className="mypage-content-section">
            <h2 className="section-title">내가 올린 질문</h2>
            <div className="questions-list">
              {questions.map((question) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <h3 className="question-title">{question.question}</h3>
                    <span className="category-tag">{question.category}</span>
                  </div>
                  <div className="question-stats">
                    <div className="stat-item">
                      <span className="stat-label">좋아요</span>
                      <span className="stat-value">{question.likes}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">작성자</span>
                      <span className="stat-value">{question.author}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">조회수</span>
                      <span className="stat-value">{question.views}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">날짜</span>
                      <span className="stat-value">{question.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mypage-page">
      <Header />

      <main className="mypage-main">
        <div className="mypage-container">
          {/* 마이페이지 헤더 */}
          <div className="mypage-header">
            <div className="mypage-title-section">
              <h1 className="mypage-title">마이 페이지</h1>
              <p className="mypage-subtitle">
                지금까지 올린 질문과 풀어낸 문제들을 확인하세요
              </p>
            </div>
          </div>

          <div className="mypage-body">
            {/* 사이드바 탭 */}
            <div className="mypage-sidebar">
              <nav className="mypage-nav">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`mypage-nav-item ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="mypage-content">
              <div className="mypage-content-wrapper">
                {renderActiveContent()}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyPage;
