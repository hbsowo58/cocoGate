import axios from 'axios';

const API_URL = 'http://localhost:8080/api/chatbot/';
 
export const sendMessage = (message) => {
  return axios.post(API_URL + 'send', { message });
}; 