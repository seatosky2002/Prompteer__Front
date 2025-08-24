// src/apis/axios.js
// 멋사 10주차 참고

import axios from "axios";
import { API_BASE_URL } from "../config/api";

// FastAPI 백엔드 baseURL 설정 (config에서 가져옴)
const BASE_URL = `${API_BASE_URL}/`;

// 누구나 접근 가능한 API들
export const instance = axios.create({

  baseURL: BASE_URL

});

// 로그인 해야지 접근 가능한 API들
export const instanceWithToken = axios.create({
  baseURL: BASE_URL

});

// request interceptor. 모든 '요청'에 토큰 추가
// instanceWithToken에는 front의 local에서 access token을 참고 담아줘야한다.
instanceWithToken.interceptors.request.use(
  // 요청을 보내기전 수행할 일
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type"); // 둘 다 front의 localStorage란 곳에 저장되어있음

    if (!accessToken) {
      // 토큰 없으면 로그인 페이지로 리다이렉트
      console.warn("No access token found. Redirecting to login...");
      window.location.href = "/login";
      return Promise.reject(new Error("No access token"));
    } else {
      // 토큰 있으면 헤더에 담아주기 (FastAPI JWT 인증)
      config.headers["Authorization"] = `${tokenType} ${accessToken}`; // fastapi 같은거랑 상관없이 http 표준 국룰 양식식
    }
    return config;
  },

  // 클라이언트 요청 오류 났을 때 처리
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// response interceptor. 모든 '응답'에 토큰 검증. 토큰 만료 상황 발생시, 토큰 만료 처리
instanceWithToken.interceptors.response.use(
  (response) => {
    // 성공 응답 처리
    return response;
  },
  (error) => {
    // 401 Unauthorized = 토큰 만료/무효 상황 발생시, localStorage에 저장되어있는 정보들 다 지우고 login 페이지로 리다이렉트.
    // 즉, api 불러올때 토큰 만료 상황 일반적으로 처리해주는 코드
    if (error.response?.status === 401) {
      console.warn("Token expired or invalid. Redirecting to login...");
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      alert("로그인을 해주세요");
      window.location.href = "/login";
      return Promise.reject(new Error("Authentication failed"));
    } else {
      // 기타 서버 오류
      console.error("Response Error:", error);
      return Promise.reject(error);
    }
  }
);
