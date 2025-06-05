import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiKey } from '../contexts/ApiKeyContext';
import './Login.css';

const Login = () => {
  const { setUser } = useApiKey();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // Removed unused location
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '로그인에 실패했습니다.');
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('로그인 응답에 토큰이 없습니다.');
      }
      
      // Store the token in localStorage for subsequent requests
      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      
      // Store user data in context and localStorage
      const userData = {
        username: data.username,
        email: data.email || '',
        token: data.token
      };
      
      // Update user data in context and localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('username', data.username);
      if (data.email) {
        localStorage.setItem('user_email', data.email);
      }
      
      // Trigger storage event to sync auth state across tabs
      window.dispatchEvent(new Event('storage'));
      
      // 로그인 후 API 키 받아오기 (필요한 경우)
      try {
        const keyRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/user/api-key`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (keyRes.ok) {
          // API 키가 필요한 경우 여기서 처리
          // const keyData = await keyRes.json();
          // 필요에 따라 상태 업데이트
        }
      } catch (e) {
        console.error('API 키 가져오기 실패:', e);
        // API 키 가져오기 실패는 로그인을 막지 않음
      }
      
      // Redirect to the main page after successful login
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || '로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>로그인</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
          <div className="signup-link">
            계정이 없으신가요? <a href="/signup">회원가입</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 