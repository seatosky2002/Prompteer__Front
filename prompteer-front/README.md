# Prompteer Front - 마이페이지

Figma 디자인을 기반으로 구현된 Prompteer 플랫폼의 마이페이지입니다.

## 🎨 디자인

이 프로젝트는 [Figma 디자인](https://www.figma.com/design/idYfB3tZeO0zdm6B0DBbFx/Prompteer_design?node-id=164-3871&t=2mR4z9PGnjgIUHxY-4)을 기반으로 구현되었습니다.

## 🚀 주요 기능

- **헤더**: 로고, 네비게이션 메뉴, 로그아웃 버튼
- **내가 올린 질문**: 사용자가 게시한 질문 목록
- **참여한 코딩 챌린지**: 5x3 그리드로 표시되는 코딩 챌린지 카드
- **참여한 이미지/영상 챌린지**: 다양한 크리에이티브 챌린지 카드
- **푸터**: 브랜드 정보, 연락처, 이용약관 링크

## 🛠️ 기술 스택

- **React** 19.1.1
- **CSS3** (Flexbox, Grid)
- **Google Fonts** (Noto Sans KR, Inter)

## 📦 컴포넌트 구조

```
src/
├── components/
│   ├── common/           # 전역 공통 컴포넌트
│   │   ├── Header/
│   │   └── Footer/
│   └── cards/            # 카드 형태 컴포넌트
│       ├── QuestionCard/
│       ├── CodingCard/
│       ├── SimpleCodingCard/
│       └── ImageCard/
├── pages/                # 페이지 컴포넌트
│   └── MyPage/
├── App.js
├── App.css
└── index.js
```

## 🎯 디자인 특징

- **색상 팔레트**:
  - 기본: #212529 (텍스트), #ffffff (배경)
  - 강조: #1971C2 (버튼, 링크)
  - 배경: #F8F9FA (페이지 배경)
  - 난이도별: #64BE75 (초급), #FF9E42 (중급), #FF4E4E (고급)

- **타이포그래피**:
  - Noto Sans KR (한글)
  - Inter (영문)

- **레이아웃**:
  - 반응형 그리드 레이아웃
  - 그림자와 호버 효과
  - 카드 기반 UI

## 🚀 시작하기

### 설치

\`\`\`bash
npm install
\`\`\`

### 개발 서버 실행

\`\`\`bash
npm start
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

\`\`\`bash
npm run build
\`\`\`

## 📱 반응형 디자인

- **데스크톱**: 5열 그리드
- **태블릿** (1200px 이하): 4열 그리드
- **모바일** (900px 이하): 3열 그리드
- **소형 모바일** (600px 이하): 2열 그리드

## 🎨 UI/UX 특징

- **접근성**: 키보드 네비게이션 및 포커스 인디케이터
- **상호작용**: 부드러운 호버 애니메이션
- **시각적 계층**: 명확한 정보 구조
- **사용성**: 직관적인 카드 기반 인터페이스

## 📄 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.