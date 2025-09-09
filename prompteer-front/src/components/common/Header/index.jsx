import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isLoading, logout } = useAuth(); // 간단하게 context를 이용하면 된다 이제.

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    alert("로그아웃 되었습니다.");
    // 페이지를 새로고침하여 로그인 상태를 완전히 초기화합니다.
    window.location.replace("/");
  };

  const isActive = (path) => {
    if (path === "/board") {
      return (
        location.pathname === "/board" ||
        // location.pathname === "/" || // 메인 페이지에서는 게시판에 파란불 X
        location.pathname.startsWith("/board/post") ||
        location.pathname.startsWith("/board/shared")
      );
    }
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => handleNavigation("/")}>
          <h1>PROMPTeer</h1>
        </div>
        <div className="nav-section">
          <nav className="nav-menu">
            <div
              className={`nav-item ${isActive("/board") ? "active" : ""}`}
              onClick={() => handleNavigation("/board")}
            >
              게시판
            </div>
            {isLoggedIn && (
              <>
                <div
                  className={`nav-item ${isActive("/mypage") ? "active" : ""}`}
                  onClick={() => handleNavigation("/mypage")}
                >
                  마이 페이지
                </div>
                <div
                  className={`nav-item ${
                    isActive("/settings") ? "active" : ""
                  }`}
                  onClick={() => handleNavigation("/settings")}
                >
                  설정
                </div>
              </>
            )}
          </nav>

          {isLoading ? (
            <div className="logout-btn" style={{ opacity: 0.5 }}>
              로딩중...
            </div>
          ) : (
            <>
              {isLoggedIn && (
                <button className="logout-btn" onClick={handleLogout}>
                  로그아웃
                </button>
              )}
              {!isLoggedIn && (
                <button
                  className="logout-btn"
                  onClick={() => handleNavigation("/login")}
                >
                  로그인
                </button>
              )}
              {!isLoggedIn && (
                <button
                  className="logout-btn"
                  onClick={() => handleNavigation("/signup")}
                >
                  회원가입
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
