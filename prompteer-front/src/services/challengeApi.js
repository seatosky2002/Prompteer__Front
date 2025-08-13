// challengeApi.js - FastAPI 챌린지 엔드포인트와 통신하는 서비스

// 임시로 직접 URL 사용 (CORS 문제 해결 전까지)
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

/**
 * 모든 챌린지를 가져오는 함수
 */
/**
 * API 응답 데이터를 프론트엔드 형식으로 변환하는 함수
 */
const transformApiChallenge = (apiChallenge) => {
  return {
    id: apiChallenge.id,
    title: apiChallenge.title,
    description: apiChallenge.description,
    challenge_type: apiChallenge.challenge_type,
    type: apiChallenge.challenge_type?.toLowerCase(), // 소문자 변환
    difficulty: apiChallenge.challenge_level === 'Normal' ? '중급' : 
               apiChallenge.challenge_level === 'Easy' ? '초급' : 
               apiChallenge.challenge_level === 'Hard' ? '고급' : '중급',
    category: apiChallenge.challenge_type === 'IMAGE' ? '이미지' : 
              apiChallenge.challenge_type === 'VIDEO' ? '영상' : 
              apiChallenge.challenge_type === 'CODE' ? '코딩' : '코딩',
    participants: Math.floor(Math.random() * 1500) + 300, // 임시 참가자 수
    createdAt: apiChallenge.created_at,
    creator_id: apiChallenge.creator_id
  };
};

export const getAllChallenges = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 데이터가 배열인지 확인하고 변환
    if (Array.isArray(data)) {
      return data.map(transformApiChallenge);
    } else {
      console.warn('API response is not an array:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching challenges:', error);
    throw error;
  }
};

/**
 * 특정 챌린지를 ID로 가져오는 함수
 */
export const getChallengeById = async (challengeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return transformApiChallenge(data);
  } catch (error) {
    console.error(`Error fetching challenge ${challengeId}:`, error);
    throw error;
  }
};

/**
 * 새로운 챌린지를 생성하는 함수
 */
export const createChallenge = async (challengeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(challengeData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw error;
  }
};

/**
 * 챌린지를 카테고리별로 필터링하는 함수
 * @param {Array} challenges - 전체 챌린지 배열
 * @param {string} category - 필터링할 카테고리 ('image' 또는 'code')
 */
export const filterChallengesByCategory = (challenges, category) => {
  if (!challenges || !Array.isArray(challenges)) {
    return [];
  }
  
  return challenges.filter(challenge => {
    // API에서 오는 실제 데이터 구조에 맞춰 조정
    const challengeType = (challenge.challenge_type || challenge.type || challenge.category || '').toLowerCase();
    
    if (category === 'image') {
      // 이미지/영상 관련 챌린지 필터링
      return challengeType === 'image' || challengeType === 'video' || 
             challengeType === 'img' || challengeType === 'visual';
    } else if (category === 'code') {
      // 코딩 관련 챌린지 필터링
      return challengeType === 'code' || challengeType === 'coding' || 
             challengeType === 'algorithm' || challengeType === 'programming';
    }
    
    return false;
  });
};

/**
 * 챌린지를 검색어로 필터링하는 함수
 */
export const searchChallenges = (challenges, searchTerm) => {
  if (!challenges || !Array.isArray(challenges) || !searchTerm) {
    return challenges || [];
  }
  
  const lowercaseSearch = searchTerm.toLowerCase();
  
  return challenges.filter(challenge =>
    (challenge.title && challenge.title.toLowerCase().includes(lowercaseSearch)) ||
    (challenge.description && challenge.description.toLowerCase().includes(lowercaseSearch)) ||
    (challenge.name && challenge.name.toLowerCase().includes(lowercaseSearch))
  );
};

/**
 * 챌린지를 난이도별로 정렬하는 함수
 */
export const sortChallengesByDifficulty = (challenges, order = 'asc') => {
  if (!challenges || !Array.isArray(challenges)) {
    return [];
  }
  
  const difficultyOrder = {
    '초급': 1,
    '중급': 2,
    '고급': 3,
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3,
    'easy': 1,
    'medium': 2,
    'hard': 3
  };
  
  return [...challenges].sort((a, b) => {
    const difficultyA = difficultyOrder[a.difficulty] || 0;
    const difficultyB = difficultyOrder[b.difficulty] || 0;
    
    return order === 'asc' ? difficultyA - difficultyB : difficultyB - difficultyA;
  });
};

export default {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  filterChallengesByCategory,
  searchChallenges,
  sortChallengesByDifficulty
};