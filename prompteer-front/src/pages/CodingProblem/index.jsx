import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
import { getCurrentUser } from '../../apis/api.js';
import './CodingProblem.css';

const CodingProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('Prompt');
  const [promptCode, setPromptCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [editorCode, setEditorCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [problemData, setProblemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [scoringResult, setScoringResult] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [othersWork, setOthersWork] = useState([]);
  const [loadingOthers, setLoadingOthers] = useState(false);
  const [sortBy, setSortBy] = useState('likes'); // 'likes', 'random', 'attempts'
  const [selectedWork, setSelectedWork] = useState(null);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [likedShares, setLikedShares] = useState(new Set()); // 사용자가 좋아요를 누른 공유들

  // 현재 사용자 정보 저장
  const [currentUser, setCurrentUser] = useState(null);

  // JWT 토큰에서 사용자 ID 추출하는 함수 (기존 코드와의 호환성을 위해 유지)
  const getCurrentUserId = () => {
    return currentUser?.id || null;
  };

  // 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('access_token');

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
    
    // 페이지 포커스 시 로그인 상태 재확인
    const handleFocus = () => {
      checkLoginStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);


  // 백엔드에서 문제 데이터 가져오기
  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/challenges/${id}`);

        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const currentProblem = await response.json();
        
        if (currentProblem) {
          console.log('Found problem data:', currentProblem);
          
          const accuracyRate = currentProblem.ps_challenge?.accuracy_rate;
          const correctRate = accuracyRate !== undefined 
            ? `${Math.round(accuracyRate * 100)}%`
            : '0%';


          // API 응답 구조에 맞게 데이터 변환
          const transformedData = {
            id: currentProblem.id,
            title: currentProblem.title || `Challenge #${currentProblem.id}`,
            category: currentProblem.tag || 'PS', // tag 필드 사용
            difficulty: currentProblem.level || 'Easy', // level 필드 사용
            content: currentProblem.content,

            timeLimit: '1 초',
            memoryLimit: '256 MB',
            correctRate: correctRate,
            problemDescription: {
              situation: currentProblem.content || '문제 상황을 불러올 수 없습니다.',
              input: '',
              output: '',
              constraints: '',
              sampleInput: '',
              sampleOutput: ''
            }
          };
          setProblemData(transformedData);
        } else {
          // 해당 ID가 없으면 기본 에러 데이터 설정
          setProblemData({
            id: id,
            title: `Challenge #${id} - 문제를 찾을 수 없습니다`,
            category: 'PS',
            difficulty: 'Easy',
            timeLimit: '1 초',
            memoryLimit: '256 MB',
            correctRate: '0%',
            problemDescription: {
              situation: '문제 데이터를 불러올 수 없습니다.',
              input: '',
              output: '',
              constraints: '',
              sampleInput: '',
              sampleOutput: ''
            }
          });
        }
      } catch (error) {
        console.error('문제 데이터 로딩 실패:', error);
        setError(error.message);
        // 에러 시 기본 데이터 설정
        setProblemData({
          id: id,
          title: `데이터 로딩 실패 (ID: ${id})`,
          category: 'PS',
          difficulty: 'Easy',
          timeLimit: '1 초',
          memoryLimit: '256 MB',
          correctRate: '0%',
          problemDescription: {
            situation: '서버에서 데이터를 불러올 수 없습니다.',
            input: '',
            output: '',
            constraints: '',
            sampleInput: '',
            sampleOutput: ''
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
  }, [id]);

  // 백엔드에서 다른 사람들의 제출물 가져오기
  const fetchOthersWork = async () => {
    try {
      setLoadingOthers(true);
      const response = await fetch(`http://localhost:8000/shares/ps/?challenge_id=${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Others work data:', data);
      
      // 현재 사용자 ID 가져오기 (백엔드 API 호출)
      let currentUserId = null;
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userResponse = await fetch('http://localhost:8000/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            currentUserId = userData.id;
            console.log('Current user ID:', currentUserId);
          }
        } catch (err) {
          console.error('Failed to get current user:', err);
        }
      }
      
      // API 응답 데이터를 컴포넌트에서 사용할 수 있는 형태로 변환
      const transformedData = data.map((work, index) => {
        // 현재 사용자가 이 공유에 좋아요를 눌렀는지 확인
        const isLiked = currentUserId && work.likes && Array.isArray(work.likes) 
          ? work.likes.some(like => like.user_id === currentUserId)
          : false;
        
        console.log(`Work ${index} isLiked:`, isLiked, 'likes:', work.likes);
        
        return {
          id: work.id || index,
          prompt: work.prompt || '프롬프트를 불러올 수 없습니다.',
          code: work.ps_share?.code || '코드를 불러올 수 없습니다.',
          memory: work.ps_share?.max_memory_kb || Math.floor(Math.random() * 1000) + 1000,
          time: work.ps_share?.elapsed_time ? Math.round(work.ps_share.elapsed_time * 1000) : Math.floor(Math.random() * 100) + 50,
          attempts: work.ps_share?.attempts || Math.floor(Math.random() * 5) + 1,
          likes: work.likes_count !== undefined ? work.likes_count : 0,
          isLiked: isLiked
        };
      });
      
      // 사용자가 좋아요를 누른 공유들 업데이트
      const likedShareIds = transformedData
        .filter(work => work.isLiked)
        .map(work => work.id);
      setLikedShares(new Set(likedShareIds));
      
      // 프론트엔드에서 정렬 적용
      const sortedData = sortDataByCriteria(transformedData, sortBy);
      setOthersWork(sortedData);
    } catch (err) {
      console.error('Failed to fetch others work:', err);
      // 에러 시 기본 데이터 사용
      setOthersWork([
        {
          id: 1,
          prompt: '알파벳 대문자 문자열 S가 주어질 때, 모든 구간 (i, j)에 대해 S[i:j] 부분 문자열에서 나타나는 문자를...',
          code: '> 1\n> 6',
          memory: 3024,
          time: 68,
          attempts: 3,
          likes: 350,
          isLiked: false
        },
        {
          id: 2,
          prompt: '문자열 처리 알고리즘으로 구간별 고유 문자 개수를 계산하는 문제입니다...',
          code: '> 1\n> 6',
          memory: 2980,
          time: 72,
          attempts: 2,
          likes: 320,
          isLiked: false
        }
      ]);
    } finally {
      setLoadingOthers(false);
    }
  };

  // 정렬 기준에 따라 데이터 정렬하는 함수
  const sortDataByCriteria = (data, criteria) => {
    const sortedData = [...data];
    console.log('Sorting data by:', criteria, 'Data:', sortedData);
    
    switch (criteria) {
      case 'likes':
        const likesSorted = sortedData.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        console.log('Likes sorted:', likesSorted.map(item => ({ id: item.id, likes: item.likes })));
        return likesSorted;
      case 'attempts':
        const attemptsSorted = sortedData.sort((a, b) => (b.attempts || 0) - (a.attempts || 0));
        console.log('Attempts sorted:', attemptsSorted.map(item => ({ id: item.id, attempts: item.attempts })));
        return attemptsSorted;
      case 'random':
        return sortedData.sort(() => Math.random() - 0.5);
      default:
        return sortedData;
    }
  };

  // 정렬 변경 시 데이터 재정렬
  useEffect(() => {
    if (othersWork.length > 0) {
      const sortedData = sortDataByCriteria(othersWork, sortBy);
      setOthersWork(sortedData);
    }
  }, [sortBy]);

  // showResult가 변경될 때 데이터 가져오기
  useEffect(() => {
    if (showResult) {
      fetchOthersWork();
    }
  }, [showResult]);


  const handleCodeGeneration = async () => {
    if (!promptCode.trim()) {
      setConsoleOutput('프롬프트를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setConsoleOutput('코드를 생성하는 중...');

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setConsoleOutput('로그인이 필요합니다.');
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch(`/challenges/ps/${id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ prompt: promptCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let generated = data.content;

      // 마크다운 코드 블록 제거
      if (generated) {
        // ```python으로 시작하고 ```로 끝나는 경우 제거
        generated = generated.replace(/^```python\s*\n/, '').replace(/\n```\s*$/, '');
        // ```로 시작하고 ```로 끝나는 경우 제거
        generated = generated.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
        // 앞뒤 공백 제거
        generated = generated.trim();
      }

      setGeneratedCode(generated);
      setEditorCode(generated);
      setConsoleOutput('코드를 생성했습니다. 우측 탭에서 code를 확인하세요.');
      setActiveTab('code');
    } catch (error) {
      console.error('Code generation error:', error);
      setConsoleOutput(`코드 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeExecution = async () => {
    if (!editorCode.trim()) {
      setConsoleOutput('실행할 코드를 입력하거나 생성해주세요.');
      return;
    }

    setIsExecuting(true);
    setConsoleOutput('코드를 채점하는 중...');
    setScoringResult(null);

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setConsoleOutput('로그인이 필요합니다.');
      setIsExecuting(false);
      return;
    }

    try {
      const response = await fetch(`/challenges/ps/${id}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ code: editorCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      setScoringResult(results);

      const consoleLog = results.map((res, index) => {
        let output = `[테스트케이스 ${index + 1}]\n- 상태: ${res.status}\n- 시간: ${res.elapsed_time.toFixed(2)}s\n- 메모리: ${res.max_memory_kb || 0}KB\n- 코드 출력(stdout):\n${res.stdout || '(없음)'}`;
        if (res.stderr) {
          output += `\n- 에러 출력(stderr):\n${res.stderr}`;
        }
        return output;
      }).join('\n\n');

      setConsoleOutput(consoleLog);
      setShowResult(true);

    } catch (error) {
      console.error('Code execution error:', error);
      setConsoleOutput(`코드 실행 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    // showOthersWork는 항상 true 유지
    setConsoleOutput('');
    setScoringResult(null);
    setActiveTab('Prompt');
  };

  const handleOtherProblem = () => {
    navigate('/');
  };

  const handleSharePrompt = () => {
    const combinedContent = `### ✨ Prompt\n\n\
${promptCode}
\
\n### 💻 Code\n\n\
python
${editorCode}
\
`;

    navigate('/board/write', {
      state: {
        problemId: id,
        initialContent: combinedContent,
        category: 'coding',
        boardCategory: '프롬프트 공유'

      }
    });
  };

  // handleViewOthers 함수 제거 - 항상 표시되므로 불필요

  const handleWorkClick = (work) => {
    setSelectedWork(work);
    setShowWorkModal(true);
  };

  const handleCloseWorkModal = () => {
    setShowWorkModal(false);
    setSelectedWork(null);
  };

  // 좋아요 추가/취소 함수
  const handleLikeToggle = async (shareId, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const isLiked = likedShares.has(shareId);
      const method = isLiked ? 'DELETE' : 'POST';
      
      console.log(`Attempting to ${isLiked ? 'unlike' : 'like'} share ${shareId}`);
      
      const response = await fetch(`http://localhost:8000/shares/${shareId}/like`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Like response status:', response.status);

      if (!response.ok) {
        if (response.status === 409) {
          // 이미 좋아요를 누른 경우 (POST 요청 시)
          alert('이미 좋아요를 누른 공유입니다.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 좋아요 상태 업데이트
      if (isLiked) {
        setLikedShares(prev => {
          const newSet = new Set(prev);
          newSet.delete(shareId);
          return newSet;
        });
        // 좋아요 수 감소
        setOthersWork(prev => prev.map(work => 
          work.id === shareId ? { ...work, likes: Math.max(0, work.likes - 1) } : work
        ));
        console.log(`Unliked share ${shareId}`);
      } else {
        setLikedShares(prev => new Set(prev).add(shareId));
        // 좋아요 수 증가
        setOthersWork(prev => prev.map(work => 
          work.id === shareId ? { ...work, likes: work.likes + 1 } : work
        ));
        console.log(`Liked share ${shareId}`);
      }
    } catch (error) {
      console.error('Like toggle error:', error);
      if (error.message.includes('HTTP error! status: 409')) {
        alert('이미 좋아요를 누른 공유입니다.');
      } else {
        alert('좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 로딩 중일 때 표시할 내용
  if (loading) {
    return (
      <div className="coding-problem-page">
        <Header isLoggedIn={isLoggedIn} />
        <main className="coding-problem-main">
          <div className="coding-problem-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>문제 데이터를 불러오는 중...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 에러가 있거나 데이터가 없을 때
  if (error || !problemData) {
    return (
      <div className="coding-problem-page">
        <Header isLoggedIn={isLoggedIn} />
        <main className="coding-problem-main">
          <div className="coding-problem-container">
            <div className="error-container">
              <p>문제 데이터를 불러올 수 없습니다.</p>
              {error && <p className="error-message">에러: {error}</p>}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="coding-problem-page">
      <Header isLoggedIn={isLoggedIn} />
      <main className="coding-problem-main">
        <div className="coding-problem-container">
          <div className="problem-layout">
            {/* 왼쪽: 문제 정보 */}
            <div className="problem-sidebar">
              <div className="problem-header">
                <div className="problem-title-section">
                  <div className="challenge-id">Challenge #{id}</div>
                  <h1 className="problem-title">{problemData.title}</h1>
                </div>
                <div className="problem-tags">
                  <div className="tags-row">
                    <div className="tag category-tag">
                      <span>{problemData.category}</span>
                    </div>
                    <div className="tag difficulty-tag">
                      <span>{problemData.difficulty}</span>
                    </div>
                  </div>
                  <div className="tag correct-rate-tag">
                    <span>정답 비율 {problemData.correctRate}</span>
                  </div>
                </div>
              </div>

              <div className="problem-content">
                {problemData.content ? (
                  <div className="problem-section">
                    <div className="section-content">
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {problemData.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="problem-section">
                      <div className="section-header">
                        <h3 className="section-title">📝 문제 상황</h3>
                      </div>
                      <div className="section-content">
                        <p className="section-text">{problemData.problemDescription?.situation || problemData.description || '문제 상황을 불러올 수 없습니다.'}</p>
                      </div>
                    </div>

                    <div className="problem-section">
                      <div className="section-header">
                        <h3 className="section-title">🎯 입력</h3>
                      </div>
                      <div className="section-content">
                        <p className="section-text">{problemData.problemDescription?.input || '입력 형식을 불러올 수 없습니다.'}</p>
                      </div>
                    </div>

                    <div className="problem-section">
                      <div className="section-header">
                        <h3 className="section-title">📤 출력</h3>
                      </div>
                      <div className="section-content">
                        <p className="section-text">{problemData.problemDescription?.output || '출력 형식을 불러올 수 없습니다.'}</p>
                      </div>
                    </div>

                    <div className="problem-section">
                      <div className="section-header">
                        <h3 className="section-title">📏 제한</h3>
                      </div>
                      <div className="section-content">
                        <p className="section-text">{problemData.problemDescription?.constraints || '제한 조건을 불러올 수 없습니다.'}</p>
                      </div>
                    </div>

                    <div className="problem-examples">
                      <div className="example-section">
                        <div className="example-header">
                          <h4 className="example-title">📥 예시 입력</h4>
                        </div>
                        <pre className="example-content input-example">
                          {problemData.problemDescription?.sampleInput || '예시 입력을 불러올 수 없습니다.'}
                        </pre>
                      </div>

                      <div className="example-section">
                        <div className="example-header">
                          <h4 className="example-title">📤 예시 출력</h4>
                        </div>
                        <pre className="example-content output-example">
                          {problemData.problemDescription?.sampleOutput || '예시 출력을 불러올 수 없습니다.'}
                        </pre>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 중앙: 코드 입력/실행 영역 */}
            <div className="code-workspace">
              <div className="workspace-section">
                <div className="code-editor-container">
                  <div className="tab-bar">
                    <button 
                      className={`tab-button ${activeTab === 'Prompt' ? 'active' : ''}`}
                      onClick={() => setActiveTab('Prompt')}
                    >
                      <span>Prompt</span>
                    </button>
                    <button 
                      className={`tab-button ${activeTab === 'code' ? 'active' : ''}`}
                      onClick={() => setActiveTab('code')}
                    >
                      <span>code</span>
                    </button>

                  </div>
                  <div className="code-editor">
                    {activeTab === 'Prompt' ? (
                      <textarea
                        className="code-textarea"
                        placeholder="이곳에 코드 생성 프롬프트를 작성하세요..."
                        value={promptCode}
                        onChange={(e) => setPromptCode(e.target.value)}
                      />
                    ) : (
                      <Editor
                        height="100%"
                        language="python"
                        value={editorCode}
                        onChange={(value) => setEditorCode(value || '')}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on',
                          theme: 'vs',
                          suggestOnTriggerCharacters: true,
                          quickSuggestions: true,
                          parameterHints: { enabled: true },
                          hover: { enabled: true },
                          folding: true,
                          bracketPairColorization: { enabled: true },
                          autoIndent: 'full',
                          formatOnPaste: true,
                          formatOnType: true,
                          tabSize: 2,
                          insertSpaces: true,
                          detectIndentation: true,
                          glyphMargin: true,
                          lineNumbersMinChars: 4
                        }}
                        placeholder="여기에 코드를 작성하거나 수정하세요..."
                        loading={<div className="editor-loading">에디터를 로딩 중...</div>}
                        onMount={(editor, monaco) => {
                          // 에디터가 마운트된 후 추가 설정
                          editor.focus();
                        }}
                      />
                    )}
                  </div>
                  {!showResult && (
                    <div className="action-buttons">
                      <button className="action-btn generate-btn" onClick={handleCodeGeneration} disabled={isGenerating}>
                        <span>{isGenerating ? '생성 중...' : '코드 생성'}</span>
                      </button>
                      <button className="action-btn execute-btn" onClick={handleCodeExecution} disabled={isExecuting}>
                        <span>{isExecuting ? '채점 중...' : '코드 실행'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽: 콘솔 영역 */}
            <div className="console-section">
              <div className="console-container">
                <div className="console-content-wrapper">
                  <div className="console-content">
                    <pre className="console-output">{consoleOutput}</pre>
                    {showResult && (
                      <>
                        <div className="result-section-inline">
                          <div className="result-header-inline">
                            <div className="result-title-inline">채점결과</div>
                          </div>
                          <div className="result-box-inline">
                            <div className={`result-status-inline ${scoringResult && scoringResult.every(r => r.status === 'Accepted') ? 'success' : ''}`}>
                              {scoringResult && scoringResult.every(r => r.status === 'Accepted') ? '정답입니다!' : '오답입니다.'}
                            </div>
                            <div className="result-details-inline">
                              {scoringResult ? (
                                scoringResult.map((res, index) => (
                                  <div key={index}>
                                    테스트케이스 {index + 1}: {res.status}
                                    {res.status !== 'Accepted' && ` (시간: ${res.elapsed_time.toFixed(2)}s, 메모리: ${res.max_memory_kb}KB)`}
                                  </div>
                                ))
                              ) : (
                                <>
                                  메모리: 34024 KB<br />
                                  시간: 68 ms<br />
                                  수동 수정: 3회
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="result-action-buttons-inline">
                          <button className="result-btn-inline retry-btn" onClick={handleRetry}>
                            <span>다시 풀기</span>
                          </button>
                          <button className="result-btn-inline other-btn" onClick={handleOtherProblem}>
                            <span>다른 문제 풀기</span>
                          </button>
                          <button className="result-btn-inline share-btn" onClick={handleSharePrompt}>
                            <span>프롬프트 공유하기</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 구경하기 섹션 (2열 레이아웃 아래) - showResult: {showResult ? 'true' : 'false'} */}
          {showResult && (
            <>
              <div className="bottom-notice">
                <p>*정답을 맞춘 문제의 프롬포트는 해당 문제를 푼 도전자에게 모두 공개됩니다.</p>
                <p>*[프롬프트 공유하기]는 해당 문제를 풀지 않아도, 모든 사람을 대상으로 게시판에 공유하는 것을 말합니다.</p>
              </div>

              <div className="view-others-section">
                <div className="view-others-header">
                  <h3>구경하기</h3>
                  <div className="sort-buttons">
                    <button 
                      className={`sort-btn ${sortBy === 'likes' ? 'active' : ''}`}
                      onClick={() => setSortBy('likes')}
                    >
                      좋아요 순
                    </button>
                    <button 
                      className={`sort-btn ${sortBy === 'random' ? 'active' : ''}`}
                      onClick={() => setSortBy('random')}
                    >
                      랜덤 순
                    </button>
                    <button 
                      className={`sort-btn ${sortBy === 'attempts' ? 'active' : ''}`}
                      onClick={() => setSortBy('attempts')}
                    >
                      수동 수정 횟수 순
                    </button>
                  </div>
                </div>
              </div>

              <div className="others-work-section">
                <div className="others-work-grid">
                    {loadingOthers ? (
                      <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>다른 사람들의 제출물을 불러오는 중...</p>
                      </div>
                    ) : othersWork.length === 0 ? (
                      <div className="no-others-work-container">
                        <p>아직 다른 사람들의 제출물이 없습니다.</p>
                        <p>첫 번째 제출물을 작성해보세요!</p>
                      </div>
                    ) : (
                      othersWork.map((work) => (
                        <div key={work.id} className="work-card" onClick={() => handleWorkClick(work)}>
                          <div className="work-stats">
                            <div className="stat-item">
                              <div className="stat-text">사용 메모리<br />{work.memory}KB</div>
                            </div>
                            <div className="stat-item">
                              <div className="stat-text">소요 시간<br />{work.time}ms</div>
                            </div>
                            <div className="stat-item">
                              <div className="stat-text">수동 수정<br />{work.attempts}회</div>
                            </div>
                          </div>
                          <div className="work-content">
                            <div className="work-prompt truncate-text">
                              {work.prompt}
                            </div>
                            <div className="work-output truncate-text">
                              <pre>{work.code}</pre>
                            </div>
                          </div>
                          <div className="work-actions">
                            <button 
                              className={`like-button ${likedShares.has(work.id) ? 'liked' : ''}`}
                              onClick={(e) => handleLikeToggle(work.id, e)}
                            >
                              <div className="heart-icon">
                                {likedShares.has(work.id) ? '❤️' : '🤍'}
                              </div>
                              <div className="like-count">{work.likes || 0}</div>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
            </>
          )}

          {/* 제출물 상세 모달 */}
          {showWorkModal && selectedWork && (
            <div className="work-modal-overlay" onClick={handleCloseWorkModal}>
              <div className="work-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <button className="modal-close-btn" onClick={handleCloseWorkModal}>
                    ×
                  </button>
                </div>
                <div className="modal-content">
                  <div className="modal-section">
                    <div className="section-title">프롬프트</div>
                    <div className="modal-prompt">
                      <pre>{selectedWork.prompt}</pre>
                    </div>
                  </div>
                  <div className="modal-section">
                    <div className="section-title">코드</div>
                    <div className="modal-code">
                      <pre>{selectedWork.code}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CodingProblem;