// API 설정 파일
// 모든 API 호출에서 사용할 기본 URL 설정

// 환경별 API 기본 URL (직접 도메인 사용으로 CORS 테스트)
export const API_BASE_URL = "http://likelion.site/api";

// 자주 사용되는 API 엔드포인트들
export const API_ENDPOINTS = {
  // 사용자 관련
  USERS_ME: `${API_BASE_URL}/users/me`,
  USERS_LOGIN: `${API_BASE_URL}/users/login`,
  USERS_REGISTER: `${API_BASE_URL}/users/register`,
  
  // 게시글 관련
  POSTS: `${API_BASE_URL}/posts`,
  
  // 챌린지 관련
  CHALLENGES_PS: `${API_BASE_URL}/challenges/ps/`,
  CHALLENGES_IMG: `${API_BASE_URL}/challenges/img/`,
  CHALLENGES_VIDEO: `${API_BASE_URL}/challenges/video/`,
  
  // 공유 관련
  SHARES_PS: `${API_BASE_URL}/shares/ps/`,
  SHARES_IMG: `${API_BASE_URL}/shares/img/`,
  SHARES_VIDEO: `${API_BASE_URL}/shares/video/`,
  
  // 미디어 관련
  MEDIA: `${API_BASE_URL}/media`
};

// 완전한 URL을 만드는 헬퍼 함수
export const buildApiUrl = (path) => {
  // path가 이미 전체 URL인 경우 그대로 반환
  if (path.startsWith('http')) {
    return path;
  }
  
  // '/'로 시작하지 않으면 추가
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${API_BASE_URL}${cleanPath}`;
};