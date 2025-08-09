import React, { useState } from 'react';
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
  const [showOthersWork, setShowOthersWork] = useState(false);

  // 문제 데이터 (실제로는 API에서 가져옴)
  const getProblemData = (problemId) => {
    const problems = {
      '11': {
        id: 11,
        title: 'Challenge #11\n알파벳 문자열',
        category: '코딩',
        difficulty: '고급',
        timeLimit: '1 초',
        memoryLimit: '256 MB',
        correctRate: '22.699%',
        problemDescription: {
          situation: '알파벳 대문자로만 이루어진 문자열 S가 있고, 길이는 N이다. S[i]는 S의 i번째 문자를 나타내고, S[i:j]는 S[i], S[i+1], ..., S[j-1], S[j]에 해당하는 S의 부분 문자열을 나타낸다. 이 문제에서 사용하는 문자열의 인덱스는 1부터 시작한다.\nU(i, j)는 S[i:j]에 나타나는 알파벳을 순서대로 정렬한 문자열을 의미하고, 중복해서 나타나는 알파벳은 제외한다.\n예를 들어, S = "ABCBA" 인 경우 U(1, 3) = "ABC"가 되며, U(2, 4) = "BC", U(1, 5) = "ABC"이다.\n모든 1 ≤ i ≤ j ≤ N에 대하여 U(i, j)을 구했을 때 이 문자열 중에서 서로 다른 문자열이 모두 몇 개 있는지 구해보자.',
          input: '첫째 줄에 테스트 케이스의 개수 T가 주어진다. 각 테스트 케이스는 한 줄로 이루어져 있고, 문자열 S가 주어진다.',
          output: '각 테스트 케이스에 대해서 U(i, j)에 서로 다른 문자열이 몇 개 있는지 출력한다.',
          constraints: '1 ≤ T ≤ 10\n1 ≤ N ≤ 100,000',
          sampleInput: '4\nAAA\nABCBA\nABABAB\nABCXYZABC',
          sampleOutput: '1\n6\n3\n30'
        }
      },
      '12': {
        id: 12,
        title: 'Challenge #12\nBFS 알고리즘',
        category: '코딩',
        difficulty: '고급',
        timeLimit: '2 초',
        memoryLimit: '512 MB',
        correctRate: '18.432%',
        problemDescription: {
          situation: '그래프에서 특정 노드로부터 모든 노드까지의 최단거리를 구하는 문제입니다. BFS(너비 우선 탐색) 알고리즘을 사용하여 해결해야 합니다.',
          input: '첫째 줄에 노드의 개수 N과 간선의 개수 M이 주어진다. 다음 M개의 줄에는 간선 정보 u v가 주어진다.',
          output: '시작 노드로부터 각 노드까지의 최단거리를 출력한다.',
          constraints: '1 ≤ N ≤ 1,000\n1 ≤ M ≤ 10,000',
          sampleInput: '5 6\n1 2\n1 3\n2 4\n3 4\n4 5\n2 5',
          sampleOutput: '0 1 1 2 2'
        }
      }
    };
    // 임시: 존재하지 않는 id로 접근 시 기본값을 Challenge #12로 매핑
    return problems[problemId] || problems['12'];
  };

  const problemData = getProblemData(id);

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
    setShowOthersWork(false);
    setConsoleOutput('');
    setActiveTab('Prompt');
  };

  const handleOtherProblem = () => {
    navigate('/');
  };

  const handleSharePrompt = () => {
    navigate('/board/write');
  };

  const handleViewOthers = () => {
    setShowOthersWork(true);
  };

  return (
    <div className="coding-problem-page">
      <Header />
      <main className="coding-problem-main">
        <div className="coding-problem-container">
          <div className="problem-layout">
            <div className="problem-main">
              {/* 왼쪽: 문제 정보 */}
              <div className="problem-sidebar">
              <div className="problem-header">
                <div className="problem-title-section">
                  <h1 className="problem-title">{problemData.title}</h1>
                </div>
                <div className="problem-tags">
                  <span className="tag category-tag">{problemData.category}</span>
                  <span className={`tag difficulty-tag difficulty-${problemData.difficulty}`}>
                    {problemData.difficulty}
                  </span>
                </div>
              </div>

              <div className="problem-stats">
                <div className="stat-item">
                  <div className="stat-text">
                    시간 제한
                    <br />
                    {problemData.timeLimit}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-text">
                    메모리 제한
                    <br />
                    {problemData.memoryLimit}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-text">
                    정답 비율
                    <br />
                    {problemData.correctRate}
                  </div>
                </div>
              </div>

              <div className="problem-content">
                <div className="problem-section">
                  <div className="section-header">
                    <h3 className="section-title">📝 문제 상황</h3>
                  </div>
                  <div className="section-content">
                    <p className="section-text">{problemData.problemDescription.situation}</p>
                  </div>
                </div>

                <div className="problem-section">
                  <div className="section-header">
                    <h3 className="section-title">🎯 입력</h3>
                  </div>
                  <div className="section-content">
                    <p className="section-text">{problemData.problemDescription.input}</p>
                  </div>
                </div>

                <div className="problem-section">
                  <div className="section-header">
                    <h3 className="section-title">📤 출력</h3>
                  </div>
                  <div className="section-content">
                    <p className="section-text">{problemData.problemDescription.output}</p>
                  </div>
                </div>

                <div className="problem-section">
                  <div className="section-header">
                    <h3 className="section-title">📏 제한</h3>
                  </div>
                  <div className="section-content">
                    <p className="section-text">{problemData.problemDescription.constraints}</p>
                  </div>
                </div>

                <div className="problem-examples">
                  <div className="example-section">
                    <div className="example-header">
                      <h4 className="example-title">📥 예시 입력</h4>
                    </div>
                    <pre className="example-content input-example">
                      {problemData.problemDescription.sampleInput}
                    </pre>
                  </div>

                  <div className="example-section">
                    <div className="example-header">
                      <h4 className="example-title">📤 예시 출력</h4>
                    </div>
                    <pre className="example-content output-example">
                      {problemData.problemDescription.sampleOutput}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Frame 135: 코드 입력/실행 영역 */}
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

            {/* Frame 136: 콘솔 영역 */}
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
          </div>

          {/* 구경하기 섹션 (2열 레이아웃 아래) */}
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
                    <button className="sort-btn active">좋아요순</button>
                    <button className="sort-btn">랜덤순</button>
                  </div>
                </div>
                {!showOthersWork && (
                  <button className="view-others-btn" onClick={handleViewOthers}>
                    다른 사람들의 풀이 보기
                  </button>
                )}
              </div>

              {showOthersWork && (
                <div className="others-work-section">
                  <div className="others-work-grid">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="work-card">
                        <div className="work-stats">
                          <div className="stat-item">
                            <div className="stat-text">사용 메모리<br />3024KB</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-text">소요 시간<br />68ms</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-text">수동 수정<br />2회</div>
                          </div>
                        </div>
                        <div className="work-content">
                          <div className="work-prompt">
                            <div className="work-section">
                              <div className="work-label">프롬포트</div>
                              <div className="work-text">
                                어쩌구저쩌구나얼마얼미아날먀어리암날먀어라얼마이럼나이라ㅓㄹ미아날마이어람
                              </div>
                            </div>
                            <div className="work-section">
                              <div className="work-output">
                                &gt; 1<br />
                                &gt; 6
                              </div>
                            </div>
                          </div>
                          <div className="work-like">
                            <div className="heart-icon">♥</div>
                            <span>10</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CodingProblem;