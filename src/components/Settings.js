import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
      setTimeout(() => navigate('/signin'), 2000);
      return;
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // API 키 형식 검증
    if (!apiKey.startsWith('sk-')) {
      setError('올바른 OpenAI API 키 형식이 아닙니다. "sk-"로 시작하는 API 키를 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      // 서버에 API 키 저장
      const response = await fetch('http://localhost:8080/api/user/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API 키 저장에 실패했습니다.');
      }

      // 로컬 스토리지에 저장
      localStorage.setItem('openai_api_key', apiKey);
      alert(data.message || 'API 키가 성공적으로 저장되었습니다.');
      navigate('/chatbot');
    } catch (error) {
      console.error('Error saving API key:', error);
      if (error.message.includes('로그인이 필요합니다')) {
        setError('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        setTimeout(() => navigate('/signin'), 2000);
      } else if (error.message.includes('Failed to fetch')) {
        setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        setError(error.message || 'API 키 저장에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2>API 키 설정</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apiKey">OpenAI API 키</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              required
            />
            <small className="help-text">
              OpenAI API 키를 입력해주세요. API 키는 안전하게 저장됩니다.
            </small>
            {error && <p className="error-text">{error}</p>}
          </div>
          <button type="submit" className="save-button">저장</button>
        </form>
      </div>
    </div>
  );
};

export default Settings; 