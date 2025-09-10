// src/utils/imageUrlHelper.js
import { API_BASE_URL } from "../config/api";

/**
 * 백엔드에서 받은 이미지 경로를 올바른 HTTP URL로 변환합니다.
 * API prefix 중복이 필요한 서버 설정에 맞춰 /api/api/media/ 형태로 변환
 *
 * @param {string} imagePath - 백엔드에서 받은 이미지 경로
 * @returns {string} - 접근 가능한 HTTP URL 또는 placeholder
 */
export const convertImagePathToUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  console.log(`🔍 convertImagePathToUrl 입력: "${imagePath}"`);

  // 이미 완전한 HTTP URL인 경우 media/media 중복 제거 처리
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    // media/media 중복 제거 (모든 발생을 처리)
    let fixedUrl = imagePath;
    while (fixedUrl.includes("/media/media/")) {
      fixedUrl = fixedUrl.replace("/media/media/", "/media/");
    }
    if (fixedUrl !== imagePath) {
      console.log(`🔧 HTTP URL 수정: "${imagePath}" → "${fixedUrl}"`);
    }
    return fixedUrl;
  }

  // 백엔드에서 받은 경로에서 'media/' 제거 후 api/media/ 붙이기
  let cleanPath = imagePath;
  if (cleanPath.startsWith("media/")) {
    cleanPath = cleanPath.substring(6); // 'media/' 제거
    console.log(`✂️ media/ 제거 후: "${cleanPath}"`);
  }
  
  const result = `http://localhost:8000/api/media/${cleanPath}`;
  console.log(`✅ 최종 URL: "${result}"`);
  return result;
};

/**
 * 이미지 로딩 실패시 처리하는 함수 (무한 루프 방지)
 *
 * @param {Event} e - 이미지 오류 이벤트
 * @param {string} originalPath - 원본 이미지 경로 (변환 전)
 */
export const handleImageError = (e, originalPath) => {
  // 재시도 횟수 확인 (무한 루프 방지)
  if (!e.target.dataset.retryCount) {
    e.target.dataset.retryCount = 1;
  } else {
    e.target.dataset.retryCount = parseInt(e.target.dataset.retryCount) + 1;
  }

  const retryCount = parseInt(e.target.dataset.retryCount);
  console.log(`🔄 이미지 로딩 실패 (${retryCount}회째): ${e.target.src}`);
  console.log(`원본 경로: ${originalPath}`);

  // 이미 재시도했거나 placeholder 이미지인 경우 숨김 처리
  if (retryCount > 1 || e.target.src.includes("via.placeholder.com")) {
    console.log("❌ 재시도 실패 또는 placeholder 실패 - 이미지 숨김 처리");
    e.target.style.display = "none";
    return;
  }

  // 원본 경로를 정리
  let cleanPath = originalPath;

  // HTTP URL이면 도메인 부분 제거해서 경로만 추출
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    try {
      const url = new URL(cleanPath);
      cleanPath = url.pathname.substring(1); // 앞의 '/' 제거
    } catch (e) {
      // URL 파싱 실패시 파일명만 추출
      cleanPath = cleanPath.split("/").pop();
    }
  }

  // '/api/' 제거
  if (cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.substring(4);
  }

  // 'media/' 중복 제거
  if (cleanPath.startsWith("media/")) {
    cleanPath = cleanPath.substring(6);
  }

  // localhost:8000으로 재시도
  const retryUrl = `http://localhost:8000/api/media/${cleanPath}`;
  console.log(`🔄 localhost:8000 재시도: ${retryUrl}`);
  e.target.src = retryUrl;
};


/**
 * 이미지 컴포넌트에서 사용할 수 있는 통합 이미지 처리 함수
 *
 * @param {string} imagePath - 백엔드에서 받은 이미지 경로
 * @returns {object} - src와 onError 핸들러를 포함한 객체
 */
export const getImageProps = (imagePath) => {
  if (!imagePath) {
    return {
      src: "https://via.placeholder.com/450x681/FAFAFA/616161?text=No+Image",
      onError: () => {},
      "data-original-path": "",
    };
  }

  const convertedUrl = convertImagePathToUrl(imagePath);

  return {
    src: convertedUrl,
    onError: (e) => handleImageError(e, imagePath),
    "data-original-path": imagePath,
  };
};

/**
 * 비디오 컴포넌트에서 사용할 수 있는 통합 비디오 처리 함수
 *
 * @param {string} videoPath - 백엔드에서 받은 비디오 경로
 * @returns {object} - src와 onError 핸들러를 포함한 객체
 */
export const getVideoProps = (videoPath) => {
  if (!videoPath) {
    return {
      src: "",
      onError: () => {},
      "data-original-path": "",
    };
  }

  const convertedUrl = convertImagePathToUrl(videoPath); // 비디오도 동일한 경로 변환 로직 사용

  return {
    src: convertedUrl,
    onError: (e) => handleImageError(e, videoPath),
    "data-original-path": videoPath,
  };
};
