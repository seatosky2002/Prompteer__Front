import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import "./Preparing.css";

const Preparing = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBoard = () => {
    navigate("/board");
  };

  return (
    <div className="preparing-page">
      <Header />

      <main className="preparing-content">
        <div className="preparing-container">
          <div className="preparing-icon">
            <div className="icon-wrapper">🚧</div>
          </div>

          <div className="preparing-message">
            <h1 className="preparing-title">준비중입니다</h1>
            <p className="preparing-description">
              해당 기능은 현재 개발 중입니다.
              <br />
              빠른 시일 내에 서비스를 제공할 예정이니
              <br />
              조금만 기다려 주세요!
            </p>
          </div>

          <div className="preparing-actions">
            <button className="action-btn primary-btn" onClick={handleGoHome}>
              메인으로 돌아가기
            </button>
            <button
              className="action-btn secondary-btn"
              onClick={handleGoBoard}
            >
              게시판 둘러보기
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Preparing;
