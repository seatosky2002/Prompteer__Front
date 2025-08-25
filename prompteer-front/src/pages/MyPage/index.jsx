import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header/index.jsx";
import MypageCodingCard from "../../components/cards/MypageCodingCard/index.jsx";
import MypageImageCard from "../../components/cards/MypageImageCard/index.jsx";
import Footer from "../../components/common/Footer/index.jsx";
import CodingDetailPrompt from "../../components/cards/CodingDetailPrompt";
import ImageDetailPrompt from "../../components/cards/ImageDetailPrompt";
import {
  getMyCompletedPsChallenges,
  getMyCompletedImgChallenges,
  getMyCompletedVideoChallenges,
  getChallengeDetails,
  getMyPosts,
} from "../../apis/api.js";
import {
  convertImagePathToUrl,
  getImageProps,
} from "../../utils/imageUrlHelper";
import "./MyPage.css";

const MyPage = () => {
  const [activeTab, setActiveTab] = useState("내가 올린 게시글");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageChallenge, setSelectedImageChallenge] = useState(null);

  // 난이도 텍스트 변환 함수
  const getDifficultyText = (level) => {
    if (!level) return "중급"; // 기본값

    const levelLower = level.toLowerCase();
    switch (levelLower) {
      case "easy":
        return "초급";
      case "medium":
        return "중급";
      case "hard":
        return "고급";
      default:
        return "중급"; // 기본값
    }
  };

  const handleCodingCardClick = (challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  const handlePostCardClick = (post) => {
    // console.log("게시글 카드 클릭:", post);
    // PostDetail 페이지로 리다이렉트
    if (post.type === "question") {
      window.location.href = `board/post/${post.id}`;
    } else if (post.type === "share") {
      window.location.href = `board/shared/${post.id}`;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedChallenge(null);
  };

  const handleImageCardClick = (challenge) => {
    setSelectedImageChallenge(challenge);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageChallenge(null);
  };

  // 코딩 챌린지 데이터 로딩
  useEffect(() => {
    const fetchCodingChallenges = async () => {
      setIsLoadingCoding(true);
      setCodingError(null);

      try {
        const result = await getMyCompletedPsChallenges();

        if (result.success) {
          // 각 챌린지의 상세 정보도 함께 가져오기
          const challengesWithDetails = await Promise.all(
            result.data.map(async (challenge) => {
              try {
                // 챌린지 상세 정보 가져오기
                const challengeDetails = await getChallengeDetails(
                  challenge.challenge_id
                );

                if (challengeDetails.success) {
                  const details = challengeDetails.data;
                  return {
                    id: challenge.id,
                    challengeNumber: challenge.challenge_id,
                    title:
                      details.title || `Challenge #${challenge.challenge_id}`,
                    description: details.content || "내용 없음",
                    difficulty: getDifficultyText(details.level),
                    prompt: challenge.prompt,
                    output: challenge.ps_share?.code || "코드 없음",
                    likes: challenge.likes_count || 0,
                    isCorrect: challenge.ps_share?.is_correct || false,
                    createdAt: challenge.created_at,
                    user: challenge.user,
                    // 추가 정보들
                    tag: details.tag,
                    accuracyRate: details.ps_challenge?.accuracy_rate || 0,
                    testcases: details.ps_challenge?.testcases || [],
                  };
                } else {
                  // 챌린지 상세 정보 가져오기 실패 시 기본 정보만 사용
                  return {
                    id: challenge.id,
                    challengeNumber: challenge.challenge_id,
                    title: `Challenge #${challenge.challenge_id}`,
                    description: challenge.prompt || "프롬프트 없음",
                    difficulty: "중급",
                    prompt: challenge.prompt,
                    output: challenge.ps_share?.code || "코드 없음",
                    likes: challenge.likes_count || 0,
                    isCorrect: challenge.ps_share?.is_correct || false,
                    createdAt: challenge.created_at,
                    user: challenge.user,
                  };
                }
              } catch (error) {
                console.error(
                  `챌린지 ${challenge.challenge_id} 상세 정보 로딩 에러:`,
                  error
                );
                // 에러 발생 시 기본 정보만 사용
                return {
                  id: challenge.id,
                  challengeNumber: challenge.challenge_id,
                  title: `Challenge #${challenge.challenge_id}`,
                  description: challenge.prompt || "프롬프트 없음",
                  difficulty: "중급",
                  prompt: challenge.prompt,
                  output: challenge.ps_share?.code || "코드 없음",
                  likes: challenge.likes_count || 0,
                  isCorrect: challenge.ps_share?.is_correct || false,
                  createdAt: challenge.created_at,
                  user: challenge.user,
                };
              }
            })
          );

          setCodingChallenges(challengesWithDetails);
        } else {
          // result.success가 false인 경우 coding error를 true로 바꿔서 error를 내보낸다
          setCodingError(result.error);
        }
      } catch (error) {
        // result를 받아오는 과정 자체가 오류인 경우
        console.error("코딩 챌린지 로딩 에러:", error);
        setCodingError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingCoding(false);
      }
    };

    // 코딩 챌린지 탭이 활성화되었을 때만 데이터 로딩
    if (activeTab === "코딩 챌린지") {
      fetchCodingChallenges();
    }
  }, [activeTab]);

  // 이미지/영상 챌린지 데이터 로딩
  useEffect(() => {
    const fetchImageChallenges = async () => {
      setIsLoadingImage(true);
      setImageError(null);

      try {
        // 이미지와 비디오 챌린지를 병렬로 가져오기
        // Promise.all로 하면 순차적으로 getMy~ 하는 것보다 빠르다.
        const [imgResult, videoResult] = await Promise.all([
          getMyCompletedImgChallenges(),
          getMyCompletedVideoChallenges(),
        ]);

        let allChallenges = [];

        // 이미지 챌린지 처리
        if (imgResult.success) {
          const imgChallengesWithDetails = await Promise.all(
            // Promise.all은 배열 안에 있는 각 챌린지들에 대한 병렬 처리를 가능하게 한다.
            // getChallengeDetails가 아래에서 계속 불러지기 때문에.
            imgResult.data.map(async (challenge) => {
              try {
                const challengeDetails = await getChallengeDetails(
                  challenge.challenge_id
                );

                if (challengeDetails.success) {
                  const details = challengeDetails.data;

                  // Reference 이미지 URL 처리
                  let referenceImageUrl = null;
                  if (
                    details.img_challenge?.references &&
                    details.img_challenge.references.length > 0
                  ) {
                    const reference = details.img_challenge.references[0];
                    if (reference.file_path) {
                      referenceImageUrl = convertImagePathToUrl(
                        reference.file_path
                      );
                      console.log(
                        `Challenge ${challenge.challenge_id} reference image converted:`,
                        reference.file_path,
                        "→",
                        referenceImageUrl
                      );
                    }
                  }

                  return {
                    id: challenge.id,
                    challengeNumber: challenge.challenge_id,
                    title:
                      details.title || `Challenge #${challenge.challenge_id}`,
                    description: details.content || "내용 없음",
                    difficulty: getDifficultyText(details.level),
                    type: "이미지",
                    prompt: challenge.prompt,
                    imageUrl: challenge.img_share?.img_url || "이미지 없음",
                    likes: challenge.likes_count || 0,
                    createdAt: challenge.created_at,
                    user: challenge.user,
                    tag: details.tag,
                    references: details.img_challenge?.references || [],
                    referenceImage: referenceImageUrl,
                  };
                } else {
                  // 여기까지 올일 없음. 이미지 Result는 받아오는데 챌린지 디테일만 못받는 경우라서.
                  return {
                    id: challenge.id,
                    challengeNumber: challenge.challenge_id,
                    title: `Challenge #${challenge.challenge_id}`,
                    description: challenge.prompt || "프롬프트 없음",
                    difficulty: "중급",
                    type: "이미지",
                    prompt: challenge.prompt,
                    imageUrl: challenge.img_share?.img_url || "이미지 없음",
                    likes: challenge.likes_count || 0,
                    createdAt: challenge.created_at,
                    user: challenge.user,
                  };
                }
              } catch (error) {
                // 에러 난 경우 기본 정보만 사용
                console.error(
                  `이미지 챌린지 ${challenge.challenge_id} 상세 정보 로딩 에러:`,
                  error
                );
                return {
                  id: challenge.id,
                  challengeNumber: challenge.challenge_id,
                  title: `Challenge #${challenge.challenge_id}`,
                  description: challenge.prompt || "프롬프트 없음",
                  difficulty: "중급",
                  type: "이미지",
                  prompt: challenge.prompt,
                  imageUrl: challenge.img_share?.img_url || "이미지 없음",
                  likes: challenge.likes_count || 0,
                  createdAt: challenge.created_at,
                  user: challenge.user,
                };
              }
            })
          );
          allChallenges = [...allChallenges, ...imgChallengesWithDetails];
        }

        // 비디오 챌린지 처리
        if (videoResult.success) {
          const videoChallengesWithDetails = await Promise.all(
            videoResult.data.map(async (challenge) => {
              try {
                const challengeDetails = await getChallengeDetails(
                  challenge.challenge_id
                );

                if (challengeDetails.success) {
                  const details = challengeDetails.data;

                  // Reference 영상 URL 처리
                  let referenceVideoUrl = null;
                  if (
                    details.video_challenge?.references &&
                    details.video_challenge.references.length > 0
                  ) {
                    const reference = details.video_challenge.references[0];
                    if (reference.file_path) {
                      referenceVideoUrl = convertImagePathToUrl(
                        reference.file_path
                      );
                      console.log(
                        `Challenge ${challenge.challenge_id} reference video converted:`,
                        reference.file_path,
                        "→",
                        referenceVideoUrl
                      );
                    }
                  }

                  return {
                    id: challenge.id,
                    challengeNumber: challenge.challenge_id,
                    title:
                      details.title || `Challenge #${challenge.challenge_id}`,
                    description: details.content || "내용 없음",
                    difficulty: getDifficultyText(details.level),
                    type: "영상",
                    prompt: challenge.prompt,
                    imageUrl: challenge.video_share?.video_url || "영상 없음",
                    likes: challenge.likes_count || 0,
                    createdAt: challenge.created_at,
                    user: challenge.user,
                    tag: details.tag,
                    references: details.video_challenge?.references || [],
                    referenceImage: referenceVideoUrl,
                  };
                } else {
                  // 여기까지 올일 없음. 이미지 Result는 받아오는데 챌린지 디테일만 못받는 경우라서.
                  return {
                    id: challenge.id,
                    challengeNumber: challenge.challenge_id,
                    title: `Challenge #${challenge.challenge_id}`,
                    description: challenge.prompt || "프롬프트 없음",
                    difficulty: "중급",
                    type: "영상",
                    prompt: challenge.prompt,
                    imageUrl: challenge.video_share?.video_url || "영상 없음",
                    likes: challenge.likes_count || 0,
                    createdAt: challenge.created_at,
                    user: challenge.user,
                  };
                }
              } catch (error) {
                console.error(
                  `비디오 챌린지 ${challenge.challenge_id} 상세 정보 로딩 에러:`,
                  error
                );
                return {
                  id: challenge.id,
                  challengeNumber: challenge.challenge_id,
                  title: `Challenge #${challenge.challenge_id}`,
                  description: challenge.prompt || "프롬프트 없음",
                  difficulty: "중급",
                  type: "영상",
                  prompt: challenge.prompt,
                  imageUrl: challenge.video_share?.video_url || "영상 없음",
                  likes: challenge.likes_count || 0,
                  createdAt: challenge.created_at,
                  user: challenge.user,
                };
              }
            })
          );
          allChallenges = [...allChallenges, ...videoChallengesWithDetails];
        }

        // 에러 처리
        if (!imgResult.success && !videoResult.success) {
          setImageError("이미지/영상 챌린지 목록을 가져올 수 없습니다.");
        } else if (!imgResult.success) {
          setImageError("이미지 챌린지 목록을 가져올 수 없습니다.");
        } else if (!videoResult.success) {
          setImageError("비디오 챌린지 목록을 가져올 수 없습니다.");
        } else {
          setImageChallenges(allChallenges);
        }
      } catch (error) {
        console.error("이미지/영상 챌린지 로딩 에러:", error);
        setImageError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingImage(false);
      }
    };

    // 이미지/영상 챌린지 탭이 활성화되었을 때만 데이터 로딩
    if (activeTab === "이미지/영상 챌린지") {
      fetchImageChallenges();
    }
  }, [activeTab]);

  // 내가 올린 게시글 데이터 로딩
  useEffect(() => {
    const fetchMyPosts = async () => {
      setIsLoadingPosts(true);
      setPostsError(null);

      try {
        const result = await getMyPosts();

        if (result.success) {
          // 게시글 데이터를 UI에 맞게 변환
          const transformedPosts = result.data.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            type: post.type, // 'question' 또는 'share'
            tag: post.tag, // 'ps', 'img', 'video'
            challengeNumber: post.challenge?.challenge_number || null,
            likes: post.likes_count || 0,
            commentsCount: post.comments?.length || 0,
            createdAt: post.created_at,
            modifiedAt: post.modified_at,
            user: post.user,
            attachments: post.attachments || [],
          }));

          setMyPosts(transformedPosts);
        } else {
          setPostsError(result.error);
        }
      } catch (error) {
        console.error("내 게시글 로딩 에러:", error);
        setPostsError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingPosts(false);
      }
    };

    // 내가 올린 게시글 탭이 활성화되었을 때만 데이터 로딩
    if (activeTab === "내가 올린 게시글") {
      fetchMyPosts();
    }
  }, [activeTab]);

  // 내가 올린 게시글 샘플 데이터
  /* const questions = [
    {
      id: 1,
      question: "왜 틀렸는지 잘 모르겠습니다.",
      category: "코딩",
      likes: 13,
      author: "뽀복",
      views: 3,
      date: "25/7/27",
    },
    {
      id: 2,
      question: "왜 틀렸는지 잘 모르겠습니다.",
      category: "코딩",
      likes: 13,
      author: "뽀복",
      views: 3,
      date: "25/7/27",
    },
    {
      id: 3,
      question: "왜 틀렸는지 잘 모르겠습니다.",
      category: "코딩",
      likes: 13,
      author: "뽀복",
      views: 3,
      date: "25/7/27",
    },
  ]; */

  // 피그마 디자인에 맞춰 18개의 코딩 챌린지 (6x3 그리드)
  // 코딩 챌린지 예전 하드코딩
  /* 
  const codingChallenges = Array(18)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      challengeNumber: 12,
      title: "BFS 알고리즘",
      description:
        "알고리즘은 뭐라고 해야할지 모르겠어서 그냥 아무말이나 적을게요:) 컴공과 부탁해요~",
      difficulty: "고급",
      prompt:
        "BFS 알고리즘을 사용해서 그래프의 최단 경로를 찾는 문제입니다. 주어진 그래프에서 시작점에서 도착점까지의 최단 거리를 계산하세요.",
      output: "> 1\n> 6\n> 3\n> 30",
      memory: "3024KB",
      time: "68ms",
      manualEdits: "2회",
      likes: 10 + index,
    }));*/

  // 실제 API에서 가져온 코딩 챌린지 데이터
  const [codingChallenges, setCodingChallenges] = useState([]); // codingChallenges에 코딩 챌린지에 관련된 데이터들을 담아놓는 변수수
  const [isLoadingCoding, setIsLoadingCoding] = useState(false);
  const [codingError, setCodingError] = useState(null);

  /*// 피그마 디자인에 맞춰 12개의 이미지/영상 챌린지 (6x2 그리드)
  const imageChallenges = [
    {
      id: 1,
      challengeNumber: 11,
      title: "일상 풍경 묘사 프롬프트 만들기",
      type: "이미지",
      difficulty: "초급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 8,
    },
    {
      id: 2,
      challengeNumber: 12,
      title: "사실적인 물거품",
      type: "이미지",
      difficulty: "고급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 15,
    },
    {
      id: 3,
      challengeNumber: 13,
      title: "뽀송뽀송한 아기 양",
      type: "이미지",
      difficulty: "초급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 12,
    },
    {
      id: 4,
      challengeNumber: 14,
      title: "바다 옆 철길을 달리는 사실적인 기차",
      type: "영상",
      difficulty: "초급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 20,
    },
    {
      id: 5,
      challengeNumber: 15,
      title: "꿀이 흐르고 보석들이 흩어져있는 핫케이크",
      type: "이미지",
      difficulty: "중급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 18,
    },
    {
      id: 6,
      challengeNumber: 16,
      title: "숲속에서 뒤를 돌아보는 흰색 요정 소녀",
      type: "영상",
      difficulty: "고급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 25,
    },
    {
      id: 7,
      challengeNumber: 11,
      title: "일상 풍경 묘사 프롬프트 만들기",
      type: "이미지",
      difficulty: "초급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 14,
    },
    {
      id: 8,
      challengeNumber: 12,
      title: "사실적인 물거품",
      type: "이미지",
      difficulty: "고급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 11,
    },
    {
      id: 9,
      challengeNumber: 13,
      title: "뽀송뽀송한 아기 양",
      type: "이미지",
      difficulty: "초급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 9,
    },
    {
      id: 10,
      challengeNumber: 14,
      title: "바다 옆 철길을 달리는 사실적인 기차",
      type: "영상",
      difficulty: "초급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 16,
    },
    {
      id: 11,
      challengeNumber: 15,
      title: "꿀이 흐르고 보석들이 흩어져있는 핫케이크",
      type: "이미지",
      difficulty: "중급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 22,
    },
    {
      id: 12,
      challengeNumber: 16,
      title: "숲속에서 뒤를 돌아보는 흰색 요정 소녀",
      type: "영상",
      difficulty: "고급",
      imageUrl: "https://via.placeholder.com/450x681",
      prompt:
        "A cute and whimsical aquatic creature, resembling a stylized, adorable water bug or pill bug, floating gracefully in a soft, dreamy underwater environment. The creature has a smooth, rounded body with segments, rendered in vibrant pastel shades of pink, orange, and light teal, with subtle iridescent or glowing accents. Its small antennae and legs are also soft and rounded. There is one larger main creature in the center, and a smaller, similar creature in the background. The background is a blurred, ethereal aquatic scene with soft light rays and gentle bubbles, using complementary pastel blues and greens. The art style is a blend of cute illustration, digital art, and 3D rendering, with soft, diffused lighting, smooth textures, and a clean, appealing aesthetic. No sharp edges or realistic insect details.",
      likes: 19,
    },
  ];*/

  // 실제 API에서 가져온 이미지/영상 챌린지 데이터
  const [imageChallenges, setImageChallenges] = useState([]);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageError, setImageError] = useState(null);

  // 실제 API에서 가져온 내가 올린 게시글 데이터
  const [myPosts, setMyPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);

  // 챌린지 미디어 데이터 (이미지/영상)
  const [challengeMedia, setChallengeMedia] = useState({});

  // 각 챌린지의 가장 인기 있는 이미지/영상 가져오기
  useEffect(() => {
    const fetchPopularMedia = async () => {
      if (imageChallenges.length === 0) return;

      console.log("Fetching popular media for challenges:", imageChallenges);
      const mediaMap = {};

      for (const challenge of imageChallenges) {
        try {
          let shareEndpoint = "";
          let mediaField = "";

          // 타입에 따라 다른 엔드포인트 사용
          if (challenge.type === "이미지") {
            shareEndpoint = `/api/shares/img/?challenge_id=${challenge.challengeNumber}&limit=10`;
            mediaField = "img_url";
          } else if (challenge.type === "영상") {
            shareEndpoint = `/api/shares/video/?challenge_id=${challenge.challengeNumber}&limit=10`;
            mediaField = "video_url";
          } else {
            continue; // 알 수 없는 타입은 건너뛰기
          }

          console.log(
            `Fetching media for challenge ${challenge.challengeNumber} (${challenge.type})`
          );
          const response = await fetch(shareEndpoint);

          if (response.ok) {
            const shares = await response.json();
            console.log(
              `Shares for challenge ${challenge.challengeNumber}:`,
              shares
            );

            if (shares && shares.length > 0) {
              // 좋아요가 가장 많은 미디어 찾기
              const sortedShares = shares.sort((a, b) => {
                const likesA = (a.likes || []).length;
                const likesB = (b.likes || []).length;
                return likesB - likesA;
              });

              const mostLikedShare = sortedShares[0];
              console.log(
                `Most liked share for challenge ${challenge.challengeNumber}:`,
                mostLikedShare
              );

              // 미디어 URL 추출
              let mediaUrl = null;
              if (challenge.type === "이미지") {
                mediaUrl =
                  mostLikedShare.img_share?.img_url ||
                  mostLikedShare.img_url ||
                  mostLikedShare.image ||
                  mostLikedShare.img;
              } else if (challenge.type === "영상") {
                mediaUrl =
                  mostLikedShare.video_share?.video_url ||
                  mostLikedShare.video_url ||
                  mostLikedShare.video;
              }

              console.log(`Raw mediaUrl from API:`, mediaUrl);

              if (mediaUrl) {
                const convertedUrl = convertImagePathToUrl(mediaUrl);
                mediaMap[challenge.id] = convertedUrl;
                console.log(
                  `Set media for challenge ${challenge.challengeNumber}:`,
                  mediaUrl,
                  "→",
                  convertedUrl
                );
              } else {
                // 좋아요가 없으면 랜덤 선택
                const randomShare =
                  shares[Math.floor(Math.random() * shares.length)];
                let randomMediaUrl = null;

                if (challenge.type === "이미지") {
                  randomMediaUrl =
                    randomShare.img_share?.img_url ||
                    randomShare.img_url ||
                    randomShare.image ||
                    randomShare.img;
                } else if (challenge.type === "영상") {
                  randomMediaUrl =
                    randomShare.video_share?.video_url ||
                    randomShare.video_url ||
                    randomShare.video;
                }

                if (randomMediaUrl) {
                  const convertedRandomUrl =
                    convertImagePathToUrl(randomMediaUrl);
                  mediaMap[challenge.id] = convertedRandomUrl;
                  console.log(
                    `Set random media for challenge ${challenge.challengeNumber}:`,
                    randomMediaUrl,
                    "→",
                    convertedRandomUrl
                  );
                } else {
                  console.log(
                    `No media URL found for challenge ${challenge.challengeNumber} in share:`,
                    randomShare
                  );
                }
              }
            } else {
              console.log(
                `No shares found for challenge ${challenge.challengeNumber}`
              );
            }
          }
        } catch (error) {
          console.error(
            `Failed to fetch media for challenge ${challenge.challengeNumber}:`,
            error
          );
        }
      }

      console.log("Final mediaMap:", mediaMap);
      setChallengeMedia(mediaMap);
    };

    fetchPopularMedia();
  }, [imageChallenges]);

  const tabs = [
    { id: "내가 올린 게시글", label: "내가 올린 게시글", icon: "❓" },
    { id: "코딩 챌린지", label: "코딩 챌린지", icon: "💻" },
    { id: "이미지/영상 챌린지", label: "이미지/영상 챌린지", icon: "🖼️" },
  ];

  const renderActiveContent = () => {
    switch (activeTab) {
      case "내가 올린 게시글":
        return (
          <div className="mypage-content-section">
            <h2 className="section-title">내가 올린 게시글</h2>
            <div className="questions-list">
              {isLoadingPosts ? (
                <div className="loading-state">
                  <p>게시글 목록을 불러오는 중...</p>
                </div>
              ) : postsError ? (
                <div className="error-state">
                  <p>에러: {postsError}</p>
                  <button onClick={() => window.location.reload()}>
                    다시 시도
                  </button>
                </div>
              ) : myPosts.length === 0 ? (
                <div className="empty-state">
                  <p>아직 작성한 게시글이 없습니다.</p>
                </div>
              ) : (
                myPosts.map(
                  (
                    post // 나중에 MypageQuestionCard 컴포넌트로 변경
                  ) => (
                    <div
                      key={post.id}
                      className="question-card"
                      onClick={() => handlePostCardClick(post)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="question-header">
                        <span className="category-tag">
                          {post.type === "question" ? "질문" : "공유"}
                          {post.tag && ` - ${post.tag.toUpperCase()}`}
                        </span>
                        <h3 className="question-title">{post.title}</h3>
                      </div>
                      <div className="question-stats">
                        <div className="stat-item">
                          <span className="stat-label">좋아요</span>
                          <span className="stat-value">{post.likes}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">작성자</span>
                          <span className="stat-value">
                            {post.user?.nickname || "알 수 없음"}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">조회수</span>
                          <span className="stat-value">0</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">날짜</span>
                          <span className="stat-value">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        );

      case "코딩 챌린지":
        return (
          <div className="mypage-content-section">
            <h2 className="section-title">참여한 코딩 챌린지 목록</h2>
            <div className="coding-section">
              {isLoadingCoding ? (
                <div className="loading-state">
                  <p>코딩 챌린지 목록을 불러오는 중...</p>
                </div>
              ) : codingError ? (
                <div className="error-state">
                  <p>에러: {codingError}</p>
                  <button onClick={() => window.location.reload()}>
                    다시 시도
                  </button>
                </div>
              ) : codingChallenges.length === 0 ? (
                <div className="empty-state">
                  <p>아직 참여한 코딩 챌린지가 없습니다.</p>
                </div>
              ) : (
                <div className="coding-grid">
                  {codingChallenges.map((challenge) => (
                    <MypageCodingCard
                      key={challenge.id}
                      {...challenge}
                      onClick={() => handleCodingCardClick(challenge)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "이미지/영상 챌린지":
        return (
          <div className="mypage-content-section">
            <h2 className="section-title">참여한 이미지/영상 챌린지 목록</h2>
            <div className="image-section">
              {isLoadingImage ? (
                <div className="loading-state">
                  <p>이미지/영상 챌린지 목록을 불러오는 중...</p>
                </div>
              ) : imageError ? (
                <div className="error-state">
                  <p>에러: {imageError}</p>
                  <button onClick={() => window.location.reload()}>
                    다시 시도
                  </button>
                </div>
              ) : imageChallenges.length === 0 ? (
                <div className="empty-state">
                  <p>아직 참여한 이미지/영상 챌린지가 없습니다.</p>
                </div>
              ) : (
                <div className="image-grid">
                  {imageChallenges.map((challenge) => (
                    <MypageImageCard
                      key={challenge.id}
                      challengeId={challenge.id}
                      title={challenge.title}
                      description={challenge.description}
                      type={challenge.type}
                      difficulty={challenge.difficulty}
                      imageUrl={
                        challenge.referenceImage || challengeMedia[challenge.id]
                      }
                      onClick={() => handleImageCardClick(challenge)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="mypage-content-section">
            <h2 className="section-title">내가 올린 게시글</h2>
            <div className="questions-list">
              {isLoadingPosts ? (
                <div className="loading-state">
                  <p>게시글 목록을 불러오는 중...</p>
                </div>
              ) : postsError ? (
                <div className="error-state">
                  <p>에러: {postsError}</p>
                  <button onClick={() => window.location.reload()}>
                    다시 시도
                  </button>
                </div>
              ) : myPosts.length === 0 ? (
                <div className="empty-state">
                  <p>아직 작성한 게시글이 없습니다.</p>
                </div>
              ) : (
                myPosts.map((post) => (
                  <div
                    key={post.id}
                    className="question-card"
                    onClick={() => handlePostCardClick(post)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="question-header">
                      <span className="category-tag">
                        {post.type === "question" ? "질문" : "공유"}
                        {post.tag && ` - ${post.tag.toUpperCase()}`}
                      </span>
                      <h3 className="question-title">{post.title}</h3>
                    </div>
                    <div className="question-stats">
                      <div className="stat-item">
                        <span className="stat-label">좋아요</span>
                        <span className="stat-value">{post.likes}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">작성자</span>
                        <span className="stat-value">
                          {post.user?.nickname || "알 수 없음"}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">조회수</span>
                        <span className="stat-value">0</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">날짜</span>
                        <span className="stat-value">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mypage-page">
      <Header />

      <main className="mypage-main">
        <div className="mypage-container">
          {/* 마이페이지 헤더 */}
          <div className="mypage-header">
            <div className="mypage-title-section">
              <h1 className="mypage-title">마이 페이지</h1>
              <p className="mypage-subtitle">
                지금까지 올린 질문과 풀어낸 문제들을 확인하세요
              </p>
            </div>
          </div>

          <div className="mypage-body">
            {/* 사이드바 탭 */}
            <div className="mypage-sidebar">
              <nav className="mypage-nav">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`mypage-nav-item ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="mypage-content">
              <div className="mypage-content-wrapper">
                {renderActiveContent()}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {isModalOpen && selectedChallenge && (
        <CodingDetailPrompt
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          challengeData={selectedChallenge}
        />
      )}

      {isImageModalOpen && selectedImageChallenge && (
        <ImageDetailPrompt
          isOpen={isImageModalOpen}
          onClose={handleCloseImageModal}
          imageData={selectedImageChallenge}
        />
      )}
    </div>
  );
};

export default MyPage;
