import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chatbot from './components/Chatbot';
import Settings from './components/Settings';
import './App.css';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import ApiKeyDashboard from './pages/ApiKeyDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for token in localStorage and validate it
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt_token');
      if (token) {
        try {
          // Optional: Add token validation API call here if needed
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          handleLogout();
        }
      }
      setIsInitialized(true);
    };

    checkAuth();

    // Sync auth state across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'jwt_token') {
        setIsLoggedIn(!!(e.newValue || localStorage.getItem('token') || localStorage.getItem('jwt_token')));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    // Clear all authentication-related data
    localStorage.removeItem('token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_email');
    localStorage.removeItem('username');
    localStorage.removeItem('openai_api_key');
    
    // Reset state
    setIsLoggedIn(false);
    
    // Navigate to home after a short delay to ensure state is updated
    setTimeout(() => window.location.href = '/', 0);
  };

  // 보호된 라우트 컴포넌트
  const ProtectedRoute = ({ children }) => {
    // Show loading state while checking auth
    if (!isInitialized) {
      return <div>Loading...</div>; // Or a proper loading component
    }
    
    if (!isLoggedIn) {
      // Redirect to signin and save the intended location
      return <Navigate to={`/signin?redirect=${encodeURIComponent(window.location.pathname)}`} replace />;
    }
    
    return children;
  };

  return (
    <ApiKeyProvider>
      <Router>
        <div className="cocogate-app-layout">
          {/* 상단 헤더 */}
          <header className="cocogate-header">
            <button className="cocogate-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="cocogate-hamburger-bar"></span>
              <span className="cocogate-hamburger-bar"></span>
              <span className="cocogate-hamburger-bar"></span>
            </button>
            <a href="/" className="cocogate-logo" style={{textDecoration:'none', color:'#3b82f6'}}>cocoGate</a>
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
                <li><a href="/chatbot" style={{color:'#6b7280',textDecoration:'none'}}><span role="img" aria-label="채팅">💬</span> 채팅</a></li>
                <li><a href="/dashboard" style={{textDecoration:'none'}}><span role="img" aria-label="도구">🛠️</span> 대시</a></li>
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
              <Route path="/dashboard" element={<ApiKeyDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ApiKeyProvider>
  );
}

export default App;
