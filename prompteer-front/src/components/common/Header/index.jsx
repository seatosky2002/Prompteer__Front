import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../../apis/api.js";
import "./Header.css";

const Header = ({ isLoggedIn: propIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부 확인하는 state

  // props로 전달받은 로그인 상태가 있으면 우선 사용
  useEffect(() => {
    if (propIsLoggedIn !== undefined) {
      setIsLoggedIn(propIsLoggedIn);
    }
  }, [propIsLoggedIn]);

  // 로그인 상태 체크 (실제 API 검증)
  useEffect(() => {
    // props로 전달받은 로그인 상태가 있으면 API 호출하지 않음
    if (propIsLoggedIn !== undefined) {
      return;
    }

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
  }, [location.pathname, propIsLoggedIn]); // propIsLoggedIn도 의존성에 추가

  // localStorage 변경 감지
  useEffect(() => {
    // props로 전달받은 로그인 상태가 있으면 localStorage 감지하지 않음
    if (propIsLoggedIn !== undefined) {
      return;
    }

    const handleStorageChange = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 컴포넌트 마운트 시에도 체크
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [propIsLoggedIn]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
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

          {isLoggedIn && <button className="logout-btn" onClick={handleLogout}>로그아웃</button>}
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
