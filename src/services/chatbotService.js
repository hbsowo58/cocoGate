import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/chatbot/`;
 
export const sendMessage = (message) => {
  return axios.post(API_URL + 'send', { message });
}; 