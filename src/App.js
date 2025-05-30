import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chatbot from './components/Chatbot';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    setIsLoggedIn(false);
    // 로그아웃 처리 로직 추가
  };

  // 보호된 라우트 컴포넌트
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/signin" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="cocogate-app-layout">
        {/* 상단 헤더 */}
        <header className="cocogate-header">
          <button className="cocogate-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="cocogate-hamburger-bar"></span>
            <span className="cocogate-hamburger-bar"></span>
            <span className="cocogate-hamburger-bar"></span>
          </button>
          <div className="cocogate-logo">cocoGate</div>
          <div className="cocogate-header-actions">
            {!isLoggedIn ? (
              <>
                <a href="/signin" className="cocogate-header-btn">로그인</a>
                <a href="/signup" className="cocogate-header-btn">회원가입</a>
              </>
            ) : (
              <>
                <a href="/settings" className="cocogate-header-btn">설정</a>
                <button className="cocogate-header-btn" onClick={handleLogout}>로그아웃</button>
              </>
            )}
          </div>
        </header>
        {/* 왼쪽 사이드바 */}
        {sidebarOpen && (
          <nav className="cocogate-sidebar">
            <ul>
              <li><span role="img" aria-label="채팅">💬</span> 채팅</li>
              <li><span role="img" aria-label="도구">🛠️</span> 도구</li>
              {isLoggedIn && (
                <li><a href="/settings" style={{color:'#3b82f6',textDecoration:'none'}}><span role="img" aria-label="설정">⚙️</span> 설정</a></li>
              )}
              {/* <li><span role="img" aria-label="혜택">🎁</span> 혜택</li> */}
              {/* <li><span role="img" aria-label="저장됨">📄</span> 저장됨</li> */}
            </ul>
          </nav>
        )}
        {/* 메인 컨텐츠 */}
        <main className="cocogate-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/signin" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route 
              path="/chatbot" 
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
