import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src="/logo.svg" alt="Logo" className="logo" />
        </Link>
      </div>
      <div className="navbar-links">
        {!isLoggedIn ? (
          <>
            <Link to="/signup" className="nav-link">회원가입</Link>
            <Link to="/signin" className="nav-link">로그인</Link>
          </>
        ) : (
          <>
            <Link to="/chatbot" className="nav-link">챗봇</Link>
            <Link to="/settings" className="nav-link">설정</Link>
            <button onClick={onLogout} className="nav-link logout-btn">로그아웃</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 