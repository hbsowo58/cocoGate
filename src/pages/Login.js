import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '로그인에 실패했습니다.');
      }

      const data = await response.json();
      
      // JWT 토큰 저장
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_email', data.email);
      localStorage.setItem('username', data.username);
      
      setIsLoggedIn(true);
      // 로그인 후 API 키 받아오기
      try {
        const keyRes = await fetch(`${process.env.REACT_APP_API_URL}/api/user/api-key`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        if (keyRes.ok) {
          const keyData = await keyRes.json();
          console.log('로그인 후 받아온 keyData:', keyData);
          // localStorage.setItem('openai_api_key', keyData.apiKey); // 제거 또는 주석처리
          // 필요하다면 상태로 올려서 관리
        }
      } catch (e) { /* 무시 */ }
      navigate('/settings');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-button">로그인</button>
        </form>
      </div>
    </div>
  );
};

export default Login; 