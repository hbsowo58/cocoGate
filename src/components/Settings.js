import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiKey } from '../contexts/ApiKeyContext';
import { testConnection, saveApiKey } from '../services/chatbotService';
import './Settings.css';

const Settings = () => {
  const { apiKey, setApiKey, user, setUser } = useApiKey();
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const navigate = useNavigate();

  // username 추출 함수
  const getUsername = () => {
    let username = '';
    if (user?.username) {
      username = user.username;
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.username) {
            username = parsedUser.username;
            setUser(parsedUser);
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    }
    return username;
  };

  // 컴포넌트 마운트 시 API 키 상태 확인
  useEffect(() => {
    let savedKey = apiKey;
    if (!savedKey) {
      savedKey = localStorage.getItem('apiKey');
      if (savedKey) setApiKey(savedKey);
    }
    if (savedKey) {
      setInputKey(savedKey);
      setIsKeySaved(true);
    }
  }, [apiKey, setApiKey]);

  // API 키 저장 및 상태 업데이트
  const saveKey = async (key, username) => {
    try {
      await saveApiKey(key, username);
      setApiKey(key);
      setIsKeySaved(true);
      setSuccess('API 키가 성공적으로 저장되었습니다!');
      setError('');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.keyExists) {
        setIsKeySaved(true);
        setSuccess('이미 등록된 API 키입니다.');
        setError('');
      } else {
        setError(error.message || 'API 키 저장 중 오류가 발생했습니다.');
        setSuccess('');
      }
    }
  };

  // 연결 테스트 (중복 저장 방지)
  const handleTestConnection = async () => {
    setIsTesting(true);
    setError('');
    setSuccess('');
    try {
      const username = getUsername();
      if (!username) throw new Error('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
      // 이미 저장된 경우 저장 생략
      if (!isKeySaved) {
        await saveKey(inputKey, username);
      }
      await testConnection(inputKey, username);
      setSuccess('API 키 저장 및 연결 테스트 성공!');
      setIsKeySaved(true);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setSuccess('');
    } finally {
      setIsTesting(false);
    }
  };

  // 저장 버튼 핸들러
  const handleSaveApiKey = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const username = getUsername();
      if (!username) throw new Error('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
      await saveKey(inputKey, username);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setSuccess('');
    }
  };

  // 폼 제출 핸들러 (저장 + 연결 테스트)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!inputKey) {
      setError('API 키를 입력해주세요.');
      return;
    }
    try {
      const username = getUsername();
      if (!username) throw new Error('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
      if (!isKeySaved) {
        await saveKey(inputKey, username);
      }
      await testConnection(inputKey, username);
      setSuccess('API 키 저장 및 연결 테스트 성공!');
      setTimeout(() => navigate('/chatbot'), 1500);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setSuccess('');
    }
  };

  // API 키 변경 기능 (비활성화 해제)
  const handleEditKey = () => {
    setIsKeySaved(false);
    setInputKey('');
    setSuccess('');
    setError('');
  };

  return (
    <div className="settings-container">
      <h2>API 키 설정</h2>
      <p>챗봇 사용을 위해 API 키를 입력해주세요.</p>
      <form onSubmit={handleSubmit} className="api-key-form">
        <div className="input-group">
          <input
            type="text"
            value={inputKey}
            // onChange={(e) => setInputKey(e.target.value)}
            onChange={(e) => setInputKey(e.target.value.trim())}
            placeholder="API 키 입력"
            className="api-key-input"
            disabled={isTesting || isKeySaved}
          />
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={!inputKey || isTesting || isKeySaved}
            className="test-button"
          >
            {isTesting ? '테스트 중...' : '연결 테스트'}
          </button>
        </div>
        {isKeySaved && (
          <div className="info-message">
            이미 등록된 API 키입니다. <button type="button" onClick={handleEditKey} className="edit-key-button">키 변경</button>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="button-group">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="secondary-button"
          >
            뒤로 가기
          </button>
          <button
            type="submit"
            disabled={!inputKey || isTesting || isKeySaved}
            className="primary-button"
            onClick={handleSaveApiKey}
          >
            저장하기
          </button>
        </div>
      </form>
      <div className="info-box">
        <h3>API 키 얻는 방법</h3>
        <ol>
          <li>관리자에게 문의</li>
          <li>키 입력 후 테스트</li>
          <li>저장 후 사용</li>
        </ol>
      </div>
    </div>
  );
};

export default Settings;
