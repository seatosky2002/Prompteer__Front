import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../apis/api.js";

// 전역 logout 함수를 저장할 변수
// axios는 context에 직접 접근할 수가 없어서 이런 trick을 써야한대.
let globalLogout = null;

// 로그인 같은건 app의 전역에서 관리를 해줘야함.
// 그럴때 유용한게 context.
// 세미나에서 다크모드 했을 때 이거 한번 사용한 적 있음.
// 이거 쓰면 변수들이 전역적으로 관리가 되어서, props를 이용해서 일일히 내려줄 필요가 없다.

// 지금 구현 로직이, 모든 이벤트마다 getcurrentuser를 호출하면 너무 loading이 커져서, header 기준으로는 앱 시작 / 2분마다 / 탭 포커스 / 다른 탭 로그아웃 / getcurrentuser 호출 -> 실패시 logout() 함수 호출 에 대해서 체크를 진행 중.
// 즉, 실제로는 토큰이 expire 되었지만 '로그인'이라고 보이는 창이 떠도, 나중에 실제 api를 사용할 때는 문제가 없고, 그 즉시 header도 바뀌게 된다.

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 초기 로그인 상태 확인
  // 일단은 처음 한번만 이렇게
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("access_token");

      // 일단 토큰이 존재하는지 여부를 판단하고
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      // 토큰이 존재하면 현재 사용자 정보를 조회하고, 로그인 상태를 업데이트함.
      // 토큰이 존재하더라도 사용자 정보 조회가 안되면 가짜 토큰인 것이니 토큰을 삭제. 토큰 삭제는 어차피 axios interceptor가 이미 처리.
      try {
        const result = await getCurrentUser();
        if (result.success) {
          setIsLoggedIn(true);
          setUser(result.data);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 로그인 함수
  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    setIsLoggedIn(false);
    setUser(null);
  };

  // 전역 logout 함수 등록
  useEffect(() => {
    globalLogout = logout;
    return () => {
      globalLogout = null;
    };
  }, []);

  // 로그인 상태 체크 함수 (재사용 가능)
  const checkLoginStatus = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      return;
    }

    try {
      const result = await getCurrentUser();
      if (result.success) {
        setIsLoggedIn(true);
        setUser(result.data);
      } else {
        // 토큰이 만료되었거나 무효함
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
    }
  };

  // localStorage 변경 감지 (다른 탭에서 로그인/로그아웃 시)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "access_token") {
        checkLoginStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 페이지 포커스 시 로그인 상태 체크 (사용자가 탭을 다시 활성화할 때)
  useEffect(() => {
    const handleFocus = () => {
      checkLoginStatus();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const value = {
    isLoggedIn,
    isLoading,
    user, // user에서는 nickname, email, is_admin, is_active, id의 정보가 들어있음.
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 이러면 이제 자식들에서 useContext(AuthContext)를 이용해서 value에 있는 것들을 다 자유롭게 사용할 수 있다.
// 혹은 바로 useAuth()를 이용할 수도 있음.

// axios interceptor에서 사용할 수 있도록 전역 logout 함수 export
export const getGlobalLogout = () => globalLogout;
