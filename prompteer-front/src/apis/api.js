// =============================================================================
// API 함수들
// =============================================================================

import { instance, instanceWithToken } from "./axios";

// Account 관련 API들
export const signIn = async (loginData) => {
  try {
    const response = await instance.post("/users/login/", loginData);

    if (response.status === 200) {
      // 로그인 성공 시 토큰 발급됨
      const { access_token, token_type } = response.data;

      // localStorage에 토큰 저장, signUp과 동일.
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("token_type", token_type);

      // 메인 페이지로 리다이렉트
      window.location.href = "/";

      return { success: true, data: response.data };
    }
  } catch (error) {
    // 에러 처리
    if (error.response?.status === 401) {
      // 인증 실패 (닉네임 또는 비밀번호 틀림)
      return {
        success: false,
        error: "닉네임 또는 비밀번호가 틀렸습니다.",
      };
    } else if (error.response?.status === 422) {
      // 아마 401과의 차이점은 비밀번호 양식이 틀린 느낌일듯
      // 유효성 검사 실패
      return {
        success: false,
        error: "입력 정보를 확인해주세요.",
        details: error.response.data.detail,
      };
    } else {
      // 네트워크 에러 등 기타 에러
      return {
        success: false,
        error: "로그인 중 오류가 발생했습니다.",
      };
    }
  }
};

export const signUp = async (userData) => {
  try {
    // 백엔드 서버 꺼졌을때와 같은 상황을 대비하여 try - catch로 구현하는게 훨씬 안전하다고 한다. response 자체가 존재하지 않는 상황이 있을 수도 있어서.
    const response = await instance.post("/users/register/", userData); // 비동기적으로 백에다가 데이터 전송 후 받음

    if (response.status === 201) {
      // 회원가입 성공 시 자동으로 토큰 발급됨
      const { access_token, token_type } = response.data; // response의 data 파싱

      // localStorage에 토큰 저장
      localStorage.setItem("access_token", access_token); // 딕셔너리처럼 localStorage에 저장할 수 있음
      localStorage.setItem("token_type", token_type);

      // 메인 페이지로 리다이렉트 (자동 로그인 완료)
      window.location.href = "/";

      return { success: true, data: response.data };
    }
  } catch (error) {
    // error는 axios가 만들어주는 에러 객체다. 그래서 그 안에 있는 데이터를 파싱해서 사용할 수 있다.
    // 에러 처리
    if (error.response?.status === 400) {
      // 닉네임 또는 이메일 중복, bad request
      return {
        success: false,
        error: "이미 존재하는 닉네임 또는 이메일입니다.",
      };
    } else if (error.response?.status === 422) {
      // 유효성 검사 실패
      return {
        success: false,
        error: "입력 정보를 확인해주세요.",
        details: error.response.data.detail, // detail로 무슨 일인지 접근 가능
      };
    } else {
      // 기타 에러
      return {
        success: false,
        error: "회원가입 중 오류가 발생했습니다.",
      };
    }
  }
};

// 이제 이 signUp과 같은 함수를 const result = await signUp(userData); 이런 식으로 사용하면 result에 리턴 값을 저장할 수 있는 것이다.

// 현재 로그인된 사용자 정보 조회 (토큰 검증 겸용, 현재 유효한 사용자인지 여부 판단. 굉장히 많이 쓰이게 될 api)
export const getCurrentUser = async () => {
  try {
    const response = await instanceWithToken.get("users/me");

    if (response.status === 200) {
      return {
        success: true,
        data: response.data, // { nickname, email, is_admin, id }
      }; // 사실상 success 여부만 이용할 예정인 느낌
    }
  } catch (error) {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 무효
      return {
        success: false,
        error: "인증이 만료되었습니다.",
      };
    } else {
      return {
        success: false,
        error: "사용자 정보를 가져올 수 없습니다.",
      };
    }
  }
};
