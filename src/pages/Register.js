import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '회원가입에 실패했습니다.');
      }

      const data = await response.json();
      
      if (data.token) {
        // Store the token in localStorage for subsequent requests
        localStorage.setItem('token', data.token);
        
        // Store user data
        if (data.email) localStorage.setItem('user_email', data.email);
        if (data.username) localStorage.setItem('username', data.username);
        
        alert('회원가입 및 로그인이 완료되었습니다.');
        navigate('/chatbot');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
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
              className="input-field"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="submit-button">가입하기</button>
        </form>
      </div>
    </div>
  );
}

export default Register; 