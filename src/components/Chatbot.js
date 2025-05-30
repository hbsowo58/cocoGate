import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';
import { useApiKey } from '../contexts/ApiKeyContext';

const Chatbot = () => {
  const { apiKey } = useApiKey();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: '안녕하세요, 고객님\n아껌없이 도와 드릴게요!'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/signin');
      return;
    }
    if (!apiKey) {
      alert('API 키를 먼저 입력해주세요.');
      navigate('/settings');
      return;
    }
  }, [navigate, apiKey]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/signin');
      return;
    }

    // 사용자 메시지 추가
    const userMessage = { type: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: inputMessage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/signin');
          return;
        }
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      
      // 봇 응답 추가
      const botMessage = { type: 'bot', content: data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        type: 'bot', 
        content: error.message.includes('API 키') 
          ? '죄송합니다. API 키 설정이 필요합니다. 설정 페이지로 이동합니다.' 
          : '죄송합니다. 오류가 발생했습니다.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (error.message.includes('API 키')) {
        setTimeout(() => navigate('/settings'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    if (isLoading) return;
    setInputMessage(action);
    handleSend({ preventDefault: () => {} });
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <button onClick={handleBack} className="back-button">←</button>
        <h2>챗봇</h2>
        <button className="refresh-button" onClick={() => window.location.reload()}>↻</button>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.type === 'bot' && (
              <div className="bot-avatar">챗봇</div>
            )}
            <div className="message-content">
              {message.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="bot-avatar">챗봇</div>
            <div className="message-content">
              <p>입력 중...</p>
            </div>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <button onClick={() => handleQuickAction("힌트 질문리스트")}>자주 묻는질문1</button>
        <button onClick={() => handleQuickAction("힌트 질문리스트")}>자주 묻는질문2</button>
        <button onClick={() => handleQuickAction("힌트 질문리스트")}>자주 묻는질문3</button>
        <button onClick={() => handleQuickAction("힌트 질문리스트")}>자주 묻는질문4</button>
        <button onClick={() => handleQuickAction("힌트 질문리스트")}>자주 묻는질문5</button>
      </div>

      <form onSubmit={handleSend} className="input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="궁금한 사항을 입력해 주세요"
          disabled={isLoading}
        />
        <button type="submit" className="send-button" disabled={isLoading}>
          <span className="send-icon">➤</span>
        </button>
      </form>
    </div>
  );
};

export default Chatbot; 