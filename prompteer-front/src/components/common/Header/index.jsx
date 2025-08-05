import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>Prompteer</h1>
        </div>
        <div className="nav-section">
          <nav className="nav-menu">
            <div className="nav-item">게시판</div>
            <div className="nav-item active">마이 페이지</div>
            <div className="nav-item">설정</div>
          </nav>
          <button className="logout-btn">로그아웃</button>
        </div>
      </div>
    </header>
  );
};

export default Header;