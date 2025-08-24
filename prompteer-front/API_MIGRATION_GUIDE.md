# API URL 마이그레이션 가이드

## 변경 사항 요약

### 1. 새로운 설정 파일 생성
- `src/config/api.js` - 모든 API URL을 중앙 관리

### 2. 변경해야 할 패턴들

#### Import 추가
```javascript
// 각 파일 상단에 추가
import { API_ENDPOINTS, buildApiUrl } from '../../config/api';
```

#### 기존 → 새로운 패턴

1. **기본 fetch 호출들**
```javascript
// 기존
fetch('/api/posts/')
// 새로운
fetch(API_ENDPOINTS.POSTS + '/')

// 기존
fetch('/api/users/me')
// 새로운
fetch(API_ENDPOINTS.USERS_ME)

// 기존
fetch('/api/challenges/ps/')
// 새로운
fetch(API_ENDPOINTS.CHALLENGES_PS)

// 기존
fetch('/api/challenges/img/')
// 새로운
fetch(API_ENDPOINTS.CHALLENGES_IMG)

// 기존
fetch('/api/challenges/video/')
// 새로운
fetch(API_ENDPOINTS.CHALLENGES_VIDEO)

// 기존
fetch('/api/shares/ps/')
// 새로운
fetch(API_ENDPOINTS.SHARES_PS)

// 기존
fetch('/api/shares/img/')
// 새로운
fetch(API_ENDPOINTS.SHARES_IMG)

// 기존
fetch('/api/shares/video/')
// 새로운
fetch(API_ENDPOINTS.SHARES_VIDEO)
```

2. **동적 URL들**
```javascript
// 기존
fetch(`/api/posts/${id}`)
// 새로운
fetch(`${API_ENDPOINTS.POSTS}/${id}`)

// 기존
fetch(`/api/challenges/${id}`)
// 새로운
fetch(buildApiUrl(`/challenges/${id}`))

// 기존
fetch(`/api/shares/${shareId}/like`)
// 새로운
fetch(buildApiUrl(`/shares/${shareId}/like`))
```

3. **미디어 URL들**
```javascript
// 기존
imageUrl = `/api/media/${imgUrl}`
// 새로운
imageUrl = `${API_ENDPOINTS.MEDIA}/${imgUrl}`

// 기존
image: '/api/media/shares/img_shares/...'
// 새로운
image: `${API_ENDPOINTS.MEDIA}/shares/img_shares/...`
```

### 3. 수정해야 할 파일 목록

#### 이미 수정된 파일들:
- ✅ `src/apis/axios.js`
- ✅ `src/services/challengeApi.js`
- ✅ `src/pages/PostWrite/index.jsx`
- ✅ `src/pages/Board/index.jsx`

#### 수정 필요한 파일들:
- `src/pages/ImageCategory/index.jsx`
- `src/pages/VideoProblem/index.jsx`
- `src/pages/PostDetail/index.jsx`
- `src/pages/ProblemDetail/index.jsx`
- `src/pages/SharedPostDetail/index.jsx`
- `src/pages/VideoCategory/index.jsx`
- `src/pages/CodingProblem/index.jsx`
- `src/pages/CodingCategory/index.jsx`
- `src/pages/ImageProblem/index.jsx`

### 4. 장점

1. **중앙 관리**: API URL을 한 곳에서 관리
2. **환경별 설정**: 개발/프로덕션 환경에 맞게 쉽게 변경 가능
3. **유지보수성**: 도메인이 바뀌면 config 파일만 수정
4. **일관성**: 모든 API 호출이 동일한 패턴 사용

### 5. 향후 개선 사항

환경 변수를 사용하여 개발/프로덕션 환경을 자동으로 감지할 수 있습니다:

```javascript
// src/config/api.js
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const API_BASE_URL = isDevelopment 
  ? "http://localhost:8000/api"
  : "http://likelion.site/api";
```