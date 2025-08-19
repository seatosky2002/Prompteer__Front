import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header/index.jsx';
import Footer from '../../components/common/Footer/index.jsx';
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
  const [showOthersWork, setShowOthersWork] = useState(true); // 기본값을 true로 변경
  const [problemData, setProblemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 백엔드에서 문제 데이터 가져오기
  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/challenges/ps/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const challenges = await response.json();
        
        // 현재 문제 ID에 해당하는 데이터 찾기
        const currentProblem = challenges.find(challenge => challenge.id == id);
        
        if (currentProblem) {
          console.log('Found problem data:', currentProblem);
          setProblemData(currentProblem);
        } else {
          // 해당 ID가 없으면 첫 번째 문제 사용
          setProblemData(challenges[0] || {
            id: id,
            title: `Challenge #${id}\n문제를 찾을 수 없습니다`,
            category: '코딩',
            difficulty: '중급',
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
          title: `Challenge #${id}\n데이터 로딩 실패`,
          category: '코딩',
          difficulty: '중급',
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

  const handleCodeGeneration = () => {
    if (!promptCode.trim()) {
      setConsoleOutput('프롬프트를 입력해주세요.');
      return;
    }

    const exampleCode = `// 생성된 코드 예시\nfunction solveProblem() {\n  // 여기에 AI가 생성한 코드가 표시됩니다\n  console.log("Hello, World!");\n}\n\nsolveProblem();`;

    setGeneratedCode(exampleCode);
    setEditorCode(exampleCode);
    setConsoleOutput('코드를 생성했습니다. 우측 탭에서 code를 확인하세요.');
    setActiveTab('code');
  };

  const handleCodeExecution = () => {
    // 피그마 디자인에 맞는 실행 결과 출력
    const executionResult = `> 1
> 6
> 3
> 30`;
    
    setConsoleOutput(executionResult);
    setShowResult(true);
  };

  const handleRetry = () => {
    setShowResult(false);
    // showOthersWork는 항상 true 유지
    setConsoleOutput('');
    setActiveTab('Prompt');
  };

  const handleOtherProblem = () => {
    navigate('/');
  };

  const handleSharePrompt = () => {
    navigate('/board/write');
  };

  // handleViewOthers 함수 제거 - 항상 표시되므로 불필요

  // 로딩 중일 때 표시할 내용
  if (loading) {
    return (
      <div className="coding-problem-page">
        <Header />
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
        <Header />
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
      <Header />
      <main className="coding-problem-main">
        <div className="coding-problem-container">
          <div className="problem-layout">
            {/* 왼쪽: 문제 정보 */}
            <div className="problem-sidebar">
              <div className="problem-header">
                <div className="problem-title-section">
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
                      <textarea
                        className="code-textarea"
                        placeholder="여기에 코드를 작성하거나 수정하세요..."
                        value={editorCode}
                        onChange={(e) => setEditorCode(e.target.value)}
                      />
                    )}
                  </div>
                  {!showResult && (
                    <div className="action-buttons">
                      <button className="action-btn generate-btn" onClick={handleCodeGeneration}>
                        <span>코드 생성</span>
                      </button>
                      <button className="action-btn execute-btn" onClick={handleCodeExecution}>
                        <span>코드 실행</span>
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
                    <div className="console-title">Console</div>
                    <pre className="console-output">{consoleOutput}</pre>
                  </div>
                </div>
                {showResult && (
                  <>
                    <div className="result-section">
                      <div className="result-header">
                        <div className="result-title">채점결과</div>
                      </div>
                      <div className="result-box">
                        <div className="result-status">정답입니다!</div>
                        <div className="result-details">
                          메모리: 34024 KB<br />
                          시간: 68 ms<br />
                          수동 수정: 3회
                        </div>
                      </div>
                    </div>
                    <div className="result-action-buttons">
                      <button className="result-btn retry-btn" onClick={handleRetry}>
                        <span>다시 풀기</span>
                      </button>
                      <button className="result-btn other-btn" onClick={handleOtherProblem}>
                        <span>다른 문제 풀기</span>
                      </button>
                      <button className="result-btn share-btn" onClick={handleSharePrompt}>
                        <span>프롬프트 공유하기</span>
                      </button>
                    </div>
                  </>
                )}
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
                    <button className="sort-btn active">좋아요 순</button>
                    <button className="sort-btn">랜덤 순</button>
                    <button className="sort-btn">수동 수정 횟수 순</button>
                  </div>
                </div>
              </div>

              <div className="others-work-section">
                <div className="others-work-grid">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="work-card">
                        <div className="work-stats">
                          <div className="stat-item">
                            <div className="stat-text">사용 메모리<br />{3000 + item * 24}KB</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-text">소요 시간<br />{60 + item * 8}ms</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-text">수동 수정<br />{item}회</div>
                          </div>
                        </div>
                        <div className="work-content">
                          <div className="work-prompt">
                            알파벳 대문자 문자열 S가 주어질 때, {'\n'}모든 구간 (i, j)에 대해 S[i:j] 부분 문자열에서 나타나는 문자를...
                          </div>
                          <div className="work-output">
                            &gt; 1{'\n'}&gt; 6
                          </div>
                        </div>
                        <div className="work-actions">
                          <button className="like-button">
                            <div className="heart-icon">♥</div>
                            <div className="like-count">{400 - item * 50}</div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CodingProblem;