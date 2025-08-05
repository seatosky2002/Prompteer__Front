# 📁 현재 폴더 구조 (재정리 완료)

```
src/
├── components/                    # 재사용 가능한 컴포넌트
│   ├── common/                   # 전역 공통 컴포넌트
│   │   ├── Header/
│   │   │   ├── index.jsx
│   │   │   └── Header.css
│   │   └── Footer/
│   │       ├── index.jsx
│   │       └── Footer.css
│   └── cards/                    # 카드 형태 컴포넌트
│       ├── QuestionCard/
│       │   ├── index.jsx
│       │   └── QuestionCard.css
│       ├── CodingCard/
│       │   ├── index.jsx
│       │   └── CodingCard.css
│       ├── SimpleCodingCard/
│       │   ├── index.jsx
│       │   └── SimpleCodingCard.css
│       └── ImageCard/
│           ├── index.jsx
│           └── ImageCard.css
├── pages/                        # 페이지 컴포넌트
│   └── MyPage/
│       ├── index.jsx
│       └── MyPage.css
├── stories/                      # Storybook 파일들
├── App.jsx
├── App.css
├── index.js
└── index.css
```

## ✅ **완료된 개선 사항**

### 1. **컴포넌트 구조화**
- `components/common/`: Header, Footer 등 전역 공통 컴포넌트
- `components/cards/`: 카드 형태의 재사용 가능한 컴포넌트들
- 각 컴포넌트는 독립된 폴더에 `index.jsx` + `CSS` 파일로 구성

### 2. **페이지 분리**
- `pages/MyPage/`: 마이페이지 관련 컴포넌트와 스타일
- 페이지별 독립된 구조로 확장 가능

### 3. **Import 경로 개선**
- 상대경로로 명확한 의존성 관리
- `index.jsx` 방식으로 깔끔한 import 구문

## 🚀 **다음 단계 확장 계획**

### Phase 1: 추가 폴더 구조
```
src/
├── hooks/                        # 커스텀 훅
├── contexts/                     # Context API
├── services/                     # API 호출 관련
├── utils/                        # 유틸리티 함수
├── styles/                       # 전역 스타일
├── assets/                       # 정적 파일
└── router/                       # 라우팅 설정
```

### Phase 2: 페이지 확장
```
pages/
├── Home/                         # 메인 페이지
├── Login/                        # 로그인 페이지
├── MyPage/                       # 마이페이지 (완료)
├── Challenges/                   # 챌린지 관련 페이지
│   ├── CodingChallenge/
│   ├── ImageChallenge/
│   └── VideoChallenge/
├── Board/                        # 게시판
└── Settings/                     # 설정
```

### Phase 3: 컴포넌트 확장
```
components/
├── common/                       # Header, Footer (완료)
├── cards/                        # 카드 컴포넌트들 (완료)
├── forms/                        # 폼 관련 컴포넌트
├── ui/                          # 기본 UI 컴포넌트
└── layout/                      # 레이아웃 컴포넌트
```

## 📋 **주요 이점**

1. **확장성**: 새로운 페이지/컴포넌트 추가가 용이
2. **재사용성**: 컴포넌트별 독립된 구조로 재사용 가능
3. **유지보수성**: 기능별 폴더 분리로 코드 관리 편의
4. **협업 효율성**: 명확한 구조로 팀 개발 시 충돌 최소화

## 🎯 **권장 네이밍 컨벤션**

- **컴포넌트**: PascalCase (Header, QuestionCard)
- **파일**: PascalCase.jsx/css 또는 index.jsx
- **폴더**: PascalCase (컴포넌트명과 동일)
- **페이지**: PascalCase (Home, MyPage)
- **유틸리티**: camelCase (useAuth.jsx)