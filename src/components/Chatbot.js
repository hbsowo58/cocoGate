import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../services/chatbotService';
import './Chatbot.css';

const Chatbot = () => {
  // Removed unused useApiKey hook
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: '안녕하세요! 무엇을 도와드릴까요?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      alert('API 키를 먼저 입력해주세요.');
      navigate('/settings');
      return;
    }
  }, [navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    // Get API key from localStorage or user object
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    let apiKey = localStorage.getItem('apiKey') || userData?.apiKey;
    console.log('1', apiKey)
    
    console.log('Current API Key:', apiKey ? '***' + apiKey.slice(-4) : 'Not found');
    
    if (!apiKey) {
      alert('API 키를 찾을 수 없습니다. 설정에서 API 키를 등록해주세요.1');
      navigate('/settings');
      return;
    }

    // Prevent multiple submissions
    setIsLoading(true);
    
    // Add user message to the UI immediately
    const userMessage = { type: 'user', content: inputMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setError(null);
    
    try {
      // Prepare chat history from the updated messages
      const chatHistory = updatedMessages
        .filter(msg => msg.type === 'user' || msg.type === 'bot')
        .slice(-10)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('userData', userData)
      const apiKey = localStorage.getItem('apiKey') || userData?.apiKey;
      
      if (!apiKey) {
        throw new Error('API 키를 찾을 수 없습니다. 설정에서 API 키를 등록해주세요.2');
      }
      
      console.log('Sending message with API key:', apiKey ? '***' + apiKey.slice(-4) : 'Not found');
      
      // Include the API key in the request
      const response = await sendMessage(inputMessage, chatHistory, apiKey);
      console.log('서버 응답:', response);
      
      const responseData = response?.data || response;
      console.log('응답 데이터:', responseData);
      
      if (responseData) {
        const botResponse = responseData.response || responseData.message || 
                          (typeof responseData === 'string' ? responseData : '응답을 처리할 수 없습니다.');
        
        // Update messages using the functional update to ensure we have the latest state
        setMessages(prev => {
          // Filter out any existing bot responses for this message to prevent duplicates
          const filtered = prev.filter((msg, idx) => 
            idx < prev.length - 1 || msg.type !== 'bot');
          return [...filtered, { type: 'bot', content: botResponse }];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || '메시지 전송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, navigate, isLoading, messages]);

  // Removed unused handleQuickAction function

  const apiKey = localStorage.getItem('apiKey');

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <button onClick={handleBack} className="back-button">
          ← 뒤로 가기
        </button>
        <h2>챗봇</h2>
      </div>
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        {error && (
          <div className="message error">
            오류가 발생했습니다: {error}
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="chatbot-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="궁금한 사항을 입력해 주세요"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !apiKey} className="send-button">
          {isLoading ? '처리 중...' : '전송'}
        </button>
      </form>
    </div>
  );
};

export default Chatbot; 