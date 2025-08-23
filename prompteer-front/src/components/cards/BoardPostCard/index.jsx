import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BoardPostCard.css';

const BoardPostCard = ({ 
  id,
  title, 
  category, 
  problemNumber, 
  author, 
  comments, 
  likes, 
  date
}) => {
  const navigate = useNavigate();

  // 데이터 확인용 로그
  console.log('BoardPostCard props:', { id, title, category, problemNumber, author, comments, likes, date });

  const handleClick = () => {
    // PS 카테고리의 프롬프트 공유 게시물인 경우 PS 공유 페이지로 이동
    if (category === 'PS' && (title.includes('프롬프트') || title.includes('공유'))) {
      navigate(`/board/ps/share`);
    } else if (category === '프롬포트' || title.includes('프롬포트') || title.includes('공유')) {
      navigate(`/board/shared/${id}`);
    } else {
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
            <span className="category-text">{category}</span>
          </div>
        </div>
      </div>

      {/* 2~7열: 통계칸 - 헤더 순서와 정확히 동일 */}
      <div className="post-right">
        <span className="post-stat">{category === 'PS' ? '코딩 질문' : '프롬프트 공유'}</span>
        <span className="post-stat">
                      {problemNumber === '프롬프트 공유' ? '프롬프트 공유' : (problemNumber || '-')}
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