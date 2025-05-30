import React, { useState } from 'react';
import { sendMessage } from '../services/chatbotService';

function Chatbot() {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendMessage(message);
      setResponses([...responses, { user: message, bot: response.data }]);
      setMessage('');
    } catch (error) {
      alert('메시지 전송 실패');
    }
  };

  return (
    <div>
      <h2>Chatbot Page</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." required />
        <button type="submit">Send</button>
      </form>
      <div>
        {responses.map((res, index) => (
          <div key={index}>
            <p><strong>User:</strong> {res.user}</p>
            <p><strong>Bot:</strong> {res.bot}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chatbot; 