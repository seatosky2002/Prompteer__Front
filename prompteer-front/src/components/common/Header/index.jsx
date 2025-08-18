import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../../apis/api.js";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부 확인하는 state

  // 로그인 상태 체크 (실제 API 검증)
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setIsLoggedIn(false); // 토큰 없으면 login false
        return;
      }

      try {
        // 실제 API로 토큰 유효성 검증
        const result = await getCurrentUser();

        if (result.success) {
          setIsLoggedIn(true);
        } else {
          // 토큰이 있지만 만료되었거나 무효함 (axios interceptor가 이미 토큰 삭제 처리함)
          setIsLoggedIn(false);
        }
      } catch (error) {
        // API 호출 실패 (네트워크 오류 등)
        console.error("Login status check failed:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // api 연결..이 필요한가? 어차피 프론트에서만 지우는건데
    // 로그아웃 처리
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    setIsLoggedIn(false);
    navigate("/");
    alert("로그아웃되었습니다.");
  };

  const isActive = (path) => {
    if (path === "/board") {
      return (
        location.pathname === "/board" ||
        // location.pathname === "/" || // 메인 페이지에서는 게시판에 파란불 X
        location.pathname.startsWith("/board/post")
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
          {isLoggedIn && <button className="logout-btn">로그아웃</button>}
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
        </div>
      </div>
    </header>
  );
};

export default Header;
