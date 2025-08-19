// challengeApi.js - FastAPI 챌린지 엔드포인트와 통신하는 서비스

// API 엔드포인트들
const CODING_API_URL = 'http://localhost:8000/challenges/ps/';
const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * 모든 챌린지를 가져오는 함수
 */
/**
 * API 응답 데이터를 프론트엔드 형식으로 변환하는 함수
 */
const transformApiChallenge = (apiChallenge) => {
  return {
    id: apiChallenge.id,
    title: `Challenge #${apiChallenge.id}\n${apiChallenge.title || '제목 없음'}`,
    description: apiChallenge.problemDescription?.situation || apiChallenge.description || '설명 없음',
    challenge_type: 'CODE',
    type: 'code',
    difficulty: apiChallenge.difficulty || '중급',
    category: '코딩',
    participants: Math.floor(Math.random() * 1500) + 300, // 임시 참가자 수
    createdAt: apiChallenge.created_at,
    creator_id: apiChallenge.creator_id
  };
};

export const getAllChallenges = async () => {
  try {
    const response = await fetch(CODING_API_URL);
    
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
  
  // 코딩 카테고리 페이지에서는 모든 챌린지가 코딩 관련이므로 필터링 없이 반환
  if (category === 'code') {
    return challenges;
  }
  
  return challenges.filter(challenge => {
    const challengeType = (challenge.challenge_type || challenge.type || challenge.category || '').toLowerCase();
    
    if (category === 'image') {
      // 이미지/영상 관련 챌린지 필터링
      return challengeType === 'image' || challengeType === 'video' || 
             challengeType === 'img' || challengeType === 'visual';
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