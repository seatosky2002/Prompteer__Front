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

  // 이미 완전한 HTTP URL인 경우 그대로 반환
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  let cleanPath = imagePath;

  // 앞에 슬래시가 있으면 제거
  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }

  // '/api/'로 시작하는 경우 제거
  if (cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.substring(4);
  }

  // 'media/media/' 중복 제거
  if (cleanPath.includes("media/media/")) {
    cleanPath = cleanPath.replace("media/media/", "media/");
  }

  // 'media/'로 시작하는 경우 제거 (나중에 다시 추가됨)
  if (cleanPath.startsWith("media/")) {
    cleanPath = cleanPath.substring(6);
  }

  // API prefix 중복 필요: /api/api/media/... 형태로 구성
  return `/api/api/media/${cleanPath}`;
};

/**
 * 이미지 로딩 실패시 대안 URL들을 시도하는 헬퍼 함수
 *
 * @param {Event} e - 이미지 오류 이벤트
 * @param {string} originalPath - 원본 이미지 경로 (변환 전)
 */
export const handleImageError = (e, originalPath) => {
  // 재시도 횟수 추적
  if (!e.target.dataset.retryCount) {
    e.target.dataset.retryCount = 1;
  } else {
    e.target.dataset.retryCount = parseInt(e.target.dataset.retryCount) + 1;
  }

  const currentSrc = e.target.src;
  const retryCount = parseInt(e.target.dataset.retryCount);

  console.log(
    `🔄 이미지 로딩 실패 (${retryCount}회째), 대안 경로 시도: ${currentSrc}`
  );
  console.log(`원본 경로: ${originalPath}`);

  // placeholder 이미지도 실패한 경우 바로 숨김 처리
  if (currentSrc.includes("via.placeholder.com")) {
    console.log("❌ Placeholder 이미지도 실패 - 이미지 숨김 처리");
    handleFinalFailure(e);
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

  const filename = cleanPath.split("/").pop();

  switch (retryCount) {
    case 1:
      // 첫 번째 대안: Reference 이미지면 api/api 경로, 아니면 API 경로
      let altUrl1;
      if (
        cleanPath.includes("challenges/img_references") ||
        cleanPath.includes("challenges/video_references")
      ) {
        if (cleanPath.startsWith("challenges/")) {
          altUrl1 = `${API_BASE_URL}/api/media/${cleanPath}`;
        } else {
          // 파일명만 있는 경우 전체 경로 구성
          const filename = cleanPath.split("/").pop();
          const refType =
            cleanPath.includes("img") || filename.includes("img")
              ? "img_references"
              : "video_references";
          altUrl1 = `${API_BASE_URL}/api/media/challenges/${refType}/${filename}`;
        }
      } else {
        altUrl1 = `${API_BASE_URL}/media/${cleanPath}`;
      }
      console.log(`Trying API path: ${altUrl1}`);
      e.target.src = altUrl1;
      break;

    case 2:
      // 두 번째 대안: nginx 직접 서빙 경로
      const altUrl2 = `https://likelion.site/media/${cleanPath}`;
      console.log(`Trying direct HTTPS media path: ${altUrl2}`);
      e.target.src = altUrl2;
      break;

    case 3:
      // 세 번째 대안: HTTP backend 포트 직접 접근
      const altUrl3 = `http://likelion.site:8000/media/${cleanPath}`;
      console.log(`Trying HTTP backend: ${altUrl3}`);
      e.target.src = altUrl3;
      break;

    case 4:
      // 네 번째 대안: 파일명만으로 시도 (shares 경우)
      if (
        cleanPath.includes("img_shares") ||
        cleanPath.includes("video_shares")
      ) {
        const shareType = cleanPath.includes("img_shares")
          ? "img_shares"
          : "video_shares";
        const altUrl4 = `https://likelion.site/media/shares/${shareType}/${filename}`;
        console.log(`Trying shares path: ${altUrl4}`);
        e.target.src = altUrl4;
      } else {
        // shares가 아니면 바로 실패 처리
        handleFinalFailure(e);
      }
      break;

    default:
      handleFinalFailure(e);
      break;
  }
};

// 최종 실패 처리를 별도 함수로 분리
const handleFinalFailure = (e) => {
  console.log(`❌ 모든 대안 URL 실패 - 이미지 숨김 처리`);
  e.target.style.display = "none";

  // 다음 형제 요소가 placeholder라면 표시
  if (e.target.nextSibling && e.target.nextSibling.style) {
    e.target.nextSibling.style.display = "flex";
  }
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
