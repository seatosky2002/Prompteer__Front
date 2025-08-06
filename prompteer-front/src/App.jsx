import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Board from './pages/Board/index.jsx';
import PostDetail from './pages/PostDetail/index.jsx';
import SharedPostDetail from './pages/SharedPostDetail/index.jsx';
import ProblemDetail from './pages/ProblemDetail/index.jsx';
import PostWrite from './pages/PostWrite/index.jsx';
import MyPage from './pages/MyPage/index.jsx';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<PostWrite />} />
          <Route path="/board" element={<Board />} />
          <Route path="/board/post/:id" element={<PostDetail />} />
          <Route path="/board/shared/:id" element={<SharedPostDetail />} />
          <Route path="/board/post/:id/problem" element={<ProblemDetail />} />
          <Route path="/board/write" element={<PostWrite />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
