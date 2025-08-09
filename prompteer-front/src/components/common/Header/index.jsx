import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    if (path === "/board") {
      return (
        location.pathname === "/board" ||
        location.pathname === "/" ||
        location.pathname.startsWith("/board/post")
      );
    }
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => handleNavigation("/board")}>
          <h1>Prompteer</h1>
        </div>
        <div className="nav-section">
          <nav className="nav-menu">
            <div
              className={`nav-item ${isActive("/board") ? "active" : ""}`}
              onClick={() => handleNavigation("/board")}
            >
              게시판
            </div>
            <div
              className={`nav-item ${isActive("/mypage") ? "active" : ""}`}
              onClick={() => handleNavigation("/mypage")}
            >
              마이 페이지
            </div>
            <div
              className={`nav-item ${isActive("/settings") ? "active" : ""}`}
              onClick={() => handleNavigation("/settings")}
            >
              {/* 설정 페이지 추가 */}
              설정
            </div>
          </nav>
          <button className="logout-btn">로그아웃</button>
          {/*<button
            className="logout-btn"
            onClick={() => handleNavigation("/login")}
          >
            로그인
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
