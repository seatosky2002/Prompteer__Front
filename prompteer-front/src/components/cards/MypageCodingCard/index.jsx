import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MypageCodingCard.css";

// mypage에 들어가는 단순화된 코딩 카드 컴포넌트

const MypageCodingCard = ({
  challengeNumber,
  title,
  difficulty = "고급",
  onClick,
}) => {
  const getDifficultyColor = (level) => {
    switch (level) {
      case "초급":
        return "#64BE75";
      case "중급":
        return "#FF9E42";
      case "고급":
        return "#FF4E4E";
      default:
        return "#FF4E4E";
    }
  };

  return (
    <div className="mypage-coding-card" onClick={onClick}>
      <div className="mypage-coding-header">
        <div className="mypage-challenge-number">
          Challenge #{challengeNumber}
        </div>
        <div className="mypage-coding-title">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // 마크다운 요소들을 인라인으로 처리하여 카드 레이아웃 유지
              p: ({children}) => <span>{children}</span>,
              strong: ({children}) => <strong>{children}</strong>,
              em: ({children}) => <em>{children}</em>,
              code: ({children}) => <code>{children}</code>,
              // 제목들은 텍스트로 처리
              h1: ({children}) => <span>{children}</span>,
              h2: ({children}) => <span>{children}</span>,
              h3: ({children}) => <span>{children}</span>,
              h4: ({children}) => <span>{children}</span>,
              h5: ({children}) => <span>{children}</span>,
              h6: ({children}) => <span>{children}</span>,
              // 리스트는 텍스트로 처리
              ul: ({children}) => <span>{children}</span>,
              ol: ({children}) => <span>{children}</span>,
              li: ({children}) => <span>{children} </span>,
              // 링크는 텍스트로 처리
              a: ({children}) => <span>{children}</span>,
              // 이미지는 숨김
              img: () => null,
              // 블록쿼트는 텍스트로 처리
              blockquote: ({children}) => <span>{children}</span>,
              // 코드 블록은 인라인 코드로 처리
              pre: ({children}) => <code>{children}</code>,
            }}
          >
            {title || "제목 없음"}
          </ReactMarkdown>
        </div>
      </div>
      <div className="mypage-coding-footer">
        <div
          className="mypage-difficulty-tag"
          style={{ backgroundColor: getDifficultyColor(difficulty) }}
        >
          <span className="mypage-difficulty-text">{difficulty}</span>
        </div>
      </div>
    </div>
  );
};

export default MypageCodingCard;
