import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BoardPostCard.css';

const BoardPostCard = ({ 
  id,
  title, 
  type,    // "question" 또는 "share"
  tag,     // "ps", "img", "video"
  problemNumber, 
  author, 
  comments, 
  likes, 
  date
}) => {
  const navigate = useNavigate();

  // 데이터 확인용 로그
  console.log('BoardPostCard props:', { id, title, type, tag, problemNumber, author, comments, likes, date });

  const handleClick = () => {
    console.log('BoardPostCard handleClick - id:', id, 'type:', type, 'tag:', tag);
    
    // 공유(share) 타입 게시물들의 라우팅
    if (type === 'share') {
      // 모든 공유 게시물은 shared 페이지로 (ID 포함)
      navigate(`/board/shared/${id}`);
    } else {
      // 질문(question) 타입은 일반 포스트 페이지로
      navigate(`/board/post/${id}`);
    }
  };

  return (
    <div className="board-post-card" onClick={handleClick}>
      {/* 1열: 제목 */}
      <div className="post-left">
        <div className="board-post-content">
          <h3 className="board-post-title">{title}</h3>
          <div className="board-post-category">
            <span className="category-text">
              {tag === 'ps' ? '코딩' : tag === 'img' ? '이미지' : tag === 'video' ? '영상' : tag}
            </span>
          </div>
        </div>
      </div>

      {/* 2~7열: 통계칸 - 헤더 순서와 정확히 동일 */}
      <div className="post-right">
        <span className="post-stat">{type === 'question' ? '질문' : '프롬프트 공유'}</span>
        <span className="post-stat">
          {problemNumber || '-'}
        </span>
        <span className="post-stat">{author}</span>
        <span className="post-stat">{comments}</span>
        <span className="post-stat">{likes}</span>
        <span className="post-stat">{date}</span>
      </div>
    </div>
  );
};

export default BoardPostCard;