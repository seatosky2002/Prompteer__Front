import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Board from './pages/Board/index.jsx';
import PostDetail from './pages/PostDetail/index.jsx';
import SharedPostDetail from './pages/SharedPostDetail/index.jsx';
import ProblemDetail from './pages/ProblemDetail/index.jsx';
import PostWrite from './pages/PostWrite/index.jsx';
import CodingCategory from './pages/CodingCategory/index.jsx';
import CodingProblem from './pages/CodingProblem/index.jsx';
import ImageCategory from './pages/ImageCategory/index.jsx';
import ImageProblem from './pages/ImageProblem/index.jsx';
import MyPage from './pages/MyPage/index.jsx';
import Settings from "./pages/Settings/index.jsx";
import Signup from "./pages/Signup/index.jsx";
import Login from "./pages/Login/index.jsx";
import './App.css';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<CodingCategory />} />
          <Route path="/board" element={<Board />} />
          <Route path="/board/post/:id" element={<PostDetail />} />
          <Route path="/board/shared/:id" element={<SharedPostDetail />} />
          <Route path="/board/post/:id/problem" element={<ProblemDetail />} />
          <Route path="/board/write" element={<PostWrite />} />
          <Route path="/category/coding" element={<CodingCategory />} />
          <Route path="/coding/problem/:id" element={<CodingProblem />} />
          <Route path="/category/image" element={<ImageCategory />} />
          <Route path="/image/challenge/:id" element={<ImageProblem />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
