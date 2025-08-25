import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Header from "../../components/common/Header/index.jsx";
import Footer from "../../components/common/Footer/index.jsx";
import FilterButton from "../../components/ui/FilterButton/index.jsx";
import CategoryFilter from "../../components/ui/CategoryFilter/index.jsx";
import CommentCard from "../../components/ui/CommentCard/index.jsx";
import {
  getCurrentUser,
  getPostById,
  getChallengeById,
  togglePostLike,
  createComment,
} from "../../apis/api.js";
import "./SharedPostDetail.css";

const SharedPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isProblemExpanded, setIsProblemExpanded] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // JWT 토큰에서 사용자 ID 추출하는 함수 (기존 코드와의 호환성을 위해 유지)
  const getCurrentUserId = () => {
    return currentUser?.id || null;
  };

  // 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setIsLoggedIn(false);
        setCurrentUser(null);
        return;
      }

      try {
        // 실제 API로 토큰 유효성 검증
        const result = await getCurrentUser();

        if (result.success) {
          setIsLoggedIn(true);
          setCurrentUser(result.data);
        } else {
          // 토큰이 있지만 만료되었거나 무효함 (axios interceptor가 이미 토큰 삭제 처리함)
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (error) {
        // API 호출 실패 (네트워크 오류 등)
        console.error("Login status check failed:", error);
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };

    checkLoginStatus();

    const handleFocus = () => {
      checkLoginStatus();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // API로부터 post 데이터 가져오기
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const result = await getPostById(id);

        if (!result.success) {
          throw new Error(result.error);
        }

        const post = result.data;
        console.log("Post data:", post);
        setShareData(post); // 기존 변수명 유지

        // 좋아요 정보 설정
        setLikesCount(post.likes_count || 0);

        // 현재 사용자가 좋아요를 눌렀는지 확인
        const currentUserId = getCurrentUserId();
        if (currentUserId && post.likes) {
          const userLiked = post.likes.some(
            (like) => like.user_id === currentUserId
          );
          setIsLiked(userLiked);
        }

        // 댓글 데이터 설정
        if (post.comments) {
          setComments(post.comments);
          console.log("Comments from post:", post.comments);
        }

        // 챌린지 데이터도 가져오기
        if (post.challenge_id) {
          await fetchChallengeData(post.challenge_id);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  // 챌린지 데이터 가져오기
  const fetchChallengeData = async (challengeId) => {
    try {
      const result = await getChallengeById(challengeId);

      if (!result.success) {
        console.warn("챌린지 데이터를 불러올 수 없습니다:", result.error);
        return;
      }

      const challenge = result.data;
      console.log("Challenge data:", challenge);
      setChallengeData(challenge);
    } catch (err) {
      console.error("Error fetching challenge:", err);
    }
  };

  const [activeTab, setActiveTab] = useState("프롬프트 공유");
  const [activeCategory, setActiveCategory] = useState("이미지");

  const tabs = ["전체", "질문", "프롬프트 공유"];
  const categories = ["전체", "코딩", "이미지", "영상"];

  const toggleProblemExpanded = () => {
    setIsProblemExpanded(!isProblemExpanded);
  };

  // 좋아요 토글 함수
  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      alert("좋아요를 누르려면 로그인이 필요합니다.");
      return;
    }

    try {
      const result = await togglePostLike(id, isLiked);

      if (!result.success) {
        alert(result.error);
        return;
      }

      // 상태 업데이트
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));

      console.log(`${isLiked ? "Unliked" : "Liked"} post ${id}`);
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  // 게시글 데이터 새로고침 (댓글 포함)
  const refreshPostData = async () => {
    try {
      const result = await getPostById(id);

      if (!result.success) {
        console.warn("게시글 데이터를 새로고침할 수 없습니다:", result.error);
        return;
      }

      const post = result.data;
      setShareData(post);

      // 댓글 데이터 업데이트
      if (post.comments) {
        setComments(post.comments);
        console.log("Updated comments:", post.comments);
      }

      // 좋아요 정보도 업데이트
      setLikesCount(post.likes_count || 0);
      const currentUserId = getCurrentUserId();
      if (currentUserId && post.likes) {
        const userLiked = post.likes.some(
          (like) => like.user_id === currentUserId
        );
        setIsLiked(userLiked);
      }
    } catch (err) {
      console.error("Error refreshing post data:", err);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      return;
    }

    if (!isLoggedIn) {
      alert("댓글을 작성하려면 로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createComment(id, newComment.trim());

      if (!result.success) {
        alert(result.error);
        return;
      }

      console.log("New comment created:", result.data);

      // 게시글 데이터 새로고침 (댓글 포함)
      await refreshPostData();

      // 입력 필드 초기화
      setNewComment("");
    } catch (error) {
      console.error("Comment creation error:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 탭 클릭 핸들러
  const handleTabClick = (tab) => {
    const typeMapping = { 질문: "question", "프롬프트 공유": "share" };
    const tagMapping = { 코딩: "ps", 이미지: "img", 영상: "video" };

    const params = new URLSearchParams();

    // 타입 필터 설정
    if (tab !== "전체" && typeMapping[tab]) {
      params.set("type", typeMapping[tab]);
    }

    // 기존 카테고리 필터 유지
    if (activeCategory !== "전체" && tagMapping[activeCategory]) {
      params.set("tag", tagMapping[activeCategory]);
    }

    const queryString = params.toString();
    navigate(queryString ? `/board?${queryString}` : "/board");
    setActiveTab(tab);
  };

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (category) => {
    const typeMapping = { 질문: "question", "프롬프트 공유": "share" };
    const tagMapping = { 코딩: "ps", 이미지: "img", 영상: "video" };

    const params = new URLSearchParams();

    // 카테고리 필터 설정
    if (category !== "전체" && tagMapping[category]) {
      params.set("tag", tagMapping[category]);
    }

    // 기존 타입 필터 유지
    if (activeTab !== "전체" && typeMapping[activeTab]) {
      params.set("type", typeMapping[activeTab]);
    }

    const queryString = params.toString();
    navigate(queryString ? `/board?${queryString}` : "/board");
    setActiveCategory(category);
  };

  // 게시물 작성 버튼 클릭 핸들러
  const handlePostWriteClick = () => {
    navigate("/board/write");
  };

  if (loading) {
    return (
      <div className="shared-post-detail-page">
        <Header isLoggedIn={isLoggedIn} />
        <main className="shared-post-detail-main">
          <div className="loading-message">데이터를 불러오는 중...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-post-detail-page">
        <Header isLoggedIn={isLoggedIn} />
        <main className="shared-post-detail-main">
          <div className="error-message">오류: {error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="shared-post-detail-page">
        <Header isLoggedIn={isLoggedIn} />
        <main className="shared-post-detail-main">
          <div className="error-message">공유 데이터를 찾을 수 없습니다.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="shared-post-detail-page">
      <Header />
      <main className="shared-post-detail-main">
        <div className="shared-post-detail-container">
          {/* 페이지 헤더 */}
          <div className="shared-post-detail-header">
            <div className="shared-post-detail-title-section">
              <h1 className="shared-post-detail-title">게시판</h1>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="shared-post-detail-content">
            {/* 필터 섹션 */}
            <div className="shared-post-detail-filters">
              <div className="tab-filters">
                <div className="tab-buttons">
                  {tabs.map((tab) => (
                    <FilterButton
                      key={tab}
                      isActive={activeTab === tab}
                      onClick={() => handleTabClick(tab)}
                    >
                      {tab}
                    </FilterButton>
                  ))}
                </div>
                <FilterButton variant="action" onClick={handlePostWriteClick}>
                  게시물 작성
                </FilterButton>
              </div>

              <div className="category-filter-section">
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={handleCategoryClick}
                />
              </div>
            </div>

            {/* 게시물 상세 */}
            <div className="shared-post-detail-body">
              <div className="shared-post-detail-card">
                <div className="shared-post-card-background"></div>
                <div className="shared-post-card-content">
                  <div className="shared-post-card-main">
                    <div className="shared-post-card-header">
                      <div className="shared-post-card-title-section">
                        <h2 className="shared-post-card-title">
                          {shareData?.title || "프롬프트 공유"}
                        </h2>
                        <div className="shared-post-card-meta">
                          <span className="shared-post-card-author">
                            작성자: {shareData.user?.nickname || "익명"}
                          </span>
                          <span className="shared-post-card-date">
                            {new Date(
                              shareData.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <hr className="shared-post-card-divider" />
                    </div>

                    <div className="shared-post-card-challenge">
                      <div className="challenge-header">
                        <div className="challenge-title-with-heart">
                          <h3 className="challenge-title">
                            {challengeData?.title ||
                              `Challenge #${shareData.challenge_id}`}
                          </h3>
                          {/* 좋아요 섹션 - Challenge Title 오른쪽으로 이동 */}
                          <div className="shared-post-like-section">
                            <button
                              className={`like-button ${
                                isLiked ? "liked" : ""
                              }`}
                              onClick={handleLikeToggle}
                            >
                              <span className="heart-icon">
                                {isLiked ? "❤️" : "🤍"}
                              </span>
                              <span className="like-count">{likesCount}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="problem-view-section">
                        <div className="problem-view-card">
                          {isProblemExpanded && (
                            <div className="problem-expanded-content">
                              <div className="problem-section">
                                <h4 className="section-title">[문제 설명]</h4>
                                <div className="section-content">
                                  {challengeData?.content ||
                                    "이미지 생성 프롬프트 공유입니다."}
                                </div>
                              </div>
                            </div>
                          )}

                          <div
                            className="problem-view-header"
                            onClick={toggleProblemExpanded}
                          >
                            <div className="problem-view-content">
                              <span className="problem-view-text">
                                문제 보기
                              </span>
                            </div>
                            <div className="problem-view-icon">
                              <svg
                                width="14"
                                height="9"
                                viewBox="0 0 14 9"
                                fill="none"
                              >
                                <path
                                  d={
                                    isProblemExpanded
                                      ? "M13 8L7 2L1 8"
                                      : "M1 1L7 7L13 1"
                                  }
                                  stroke="#000000"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 포스트 내용 섹션 */}
                      <div className="shared-post-content-section">
                        <h4 className="section-title">공유 내용</h4>
                        <div className="post-content-container">
                          {shareData?.content ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                img: ({ node, ...props }) => (
                                  <img
                                    {...props}
                                    style={{
                                      maxWidth: "100%",
                                      height: "auto",
                                      borderRadius: "8px",
                                    }}
                                    onError={(e) => {
                                      console.error(
                                        "❌ Markdown image failed to load:",
                                        e.target.src
                                      );
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ),
                                a: ({ node, href, children, ...props }) => {
                                  // 비디오 파일 링크인지 확인
                                  if (
                                    href &&
                                    (href.includes(".mp4") ||
                                      href.includes("video") ||
                                      children?.[0] === "영상 파일")
                                  ) {
                                    console.log("Video link detected:", href);

                                    // media/media/ 중복 제거
                                    let cleanUrl = href;
                                    if (href.includes("media/media/")) {
                                      cleanUrl = href.replace(
                                        "media/media/",
                                        "media/"
                                      );
                                    }

                                    // 상대 경로를 절대 경로로 변환
                                    if (!cleanUrl.startsWith("http")) {
                                      cleanUrl = `/api/${cleanUrl}`;
                                    }

                                    return (
                                      <div
                                        style={{
                                          margin: "20px 0",
                                          textAlign: "center",
                                        }}
                                      >
                                        <video
                                          src={cleanUrl}
                                          controls
                                          style={{
                                            maxWidth: "100%",
                                            height: "auto",
                                            borderRadius: "8px",
                                            boxShadow:
                                              "0 4px 12px rgba(0, 0, 0, 0.1)",
                                          }}
                                          onError={(e) => {
                                            console.error(
                                              "❌ Markdown video failed to load:",
                                              cleanUrl
                                            );
                                            e.target.parentElement.innerHTML = `
                                              <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 200px; background: #F8F9FA; border: 2px dashed #DEE2E6; border-radius: 8px; color: #6C757D;">
                                                <span>영상을 불러올 수 없습니다</span>
                                                <p style="font-size: 12px; color: #ADB5BD; margin: 5px 0; word-break: break-all;">${cleanUrl}</p>
                                              </div>
                                            `;
                                          }}
                                        >
                                          브라우저가 비디오를 지원하지 않습니다.
                                        </video>
                                      </div>
                                    );
                                  }

                                  // 일반 링크는 그대로 처리
                                  return (
                                    <a href={href} {...props}>
                                      {children}
                                    </a>
                                  );
                                },
                              }}
                            >
                              {shareData.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="content-placeholder">
                              <span>내용이 없습니다</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 댓글 섹션 */}
              <div className="comments-section">
                <div className="comments-header">
                  <h3 className="comments-title">댓글 ({comments.length})</h3>
                </div>

                <div className="figma-comments-container">
                  {comments.length === 0 ? (
                    <div className="no-comments">
                      <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="figma-comment-item">
                        <div className="figma-comment-content">
                          {comment.content}
                        </div>
                        <div className="figma-comment-author">
                          {comment.user?.nickname || "익명"}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="comment-write-section">
                  {/* Figma 디자인에 맞는 댓글 작성 영역 */}
                  <div className="figma-comment-container">
                    <div className="figma-comment-input-area">
                      <textarea
                        className="figma-comment-input"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleCommentSubmit();
                          }
                        }}
                        placeholder="댓글을 입력하세요..."
                        rows={2}
                        disabled={isSubmitting}
                      />
                    </div>
                    <button
                      className="figma-comment-submit-btn"
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim() || isSubmitting}
                    >
                      {isSubmitting ? "작성 중..." : "댓글 작성"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SharedPostDetail;
