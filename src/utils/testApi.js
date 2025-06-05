import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// testApi.js
const testApiCall = async (apiKey) => {
  try {
      if (!apiKey) {
          throw new Error('API 키가 제공되지 않았습니다.');
      }

      console.log("Testing API with key:", `${apiKey.substring(0, 10)}...`);
      
      // 프록시 키면 proxy-send 엔드포인트로 분기
      let endpoint = `${API_BASE_URL}/api/chat/send`;
      if (apiKey.startsWith('proxy_')) {
        endpoint = `${API_BASE_URL}/api/chat/proxy-send`;
      }

      const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
      };

      const requestData = {
          message: "API 연결 테스트 메시지입니다.",
          history: []
      };

      console.log("Sending request to:", endpoint);
      console.log("Request headers:", headers);
      console.log("Request data:", requestData);
    
      // 1. API 호출
      const response = await axios.post(
          endpoint,
          requestData,
          { headers }
      );

      console.log("API Response:", response.data);
      
      // 2. 토큰 사용량 업데이트
      if (response.data && response.data.tokens_used) {
          try {
              // JWT 토큰이 필요한 경우, 로컬 스토리지에서 가져옴
              const token = localStorage.getItem('token');
              if (token) {
                  // API 키 ID를 가져오기 위해 API 키 목록을 조회
                  const keysResponse = await axios.get(`${API_BASE_URL}/api/keys`, {
                      headers: {
                          'Authorization': `Bearer ${token}`
                      }
                  });
                  
                  // 현재 API 키에 해당하는 키 정보 찾기
                  const currentKey = keysResponse.data.find(key => key.key === apiKey);
                  if (currentKey) {
                      // 토큰 사용량 업데이트 요청 (keyId를 URL 경로에 포함)
                      await axios.post(
                          `${API_BASE_URL}/api/keys/${currentKey.id}/usage`,
                          {
                              tokensUsed: response.data.tokens_used,
                              operation: 'test'
                          },
                          { 
                              headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                              } 
                          }
                      );
                      console.log("Token usage updated successfully");
                  } else {
                      console.warn("API key not found in the user's key list");
                  }
              } else {
                  console.warn("JWT 토큰을 찾을 수 없어 토큰 사용량을 업데이트하지 못했습니다.");
              }
          } catch (updateError) {
              console.warn("토큰 사용량 업데이트 실패:", updateError.message);
              // 토큰 업데이트 실패는 치명적이지 않으므로 계속 진행
          }
      }

      return {
          success: true,
          data: response.data
      };
  } catch (error) {
      console.error("API 테스트 중 오류 발생:", error);
      
      let errorMessage = "API 테스트 중 오류가 발생했습니다.";
      if (error.response) {
          // 서버에서 에러 응답이 온 경우
          errorMessage = error.response.data?.message || errorMessage;
          console.error("Error response data:", error.response.data);
      } else if (error.request) {
          // 요청이 전송되었지만 응답을 받지 못한 경우
          errorMessage = "서버로부터 응답을 받지 못했습니다.";
      }
      
      return {
          success: false,
          error: errorMessage
      };
  }
};

export const saveApiKey = async (apiKey, username) => {
  try {
    // ... 기존 검증 ...
    const cleanApiKey = apiKey.trim();
    if (cleanApiKey.length < 160) {
      throw new Error('API 키가 너무 짧습니다. 전체 키를 복사해 붙여넣으세요.');
    }
    // JWT 토큰을 반드시 포함
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = userData?.token;
    if (!token) throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
    const response = await axios.post(
      '/api/user/api-key',
      { apiKey: cleanApiKey },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Username': username,
          'Authorization': `Bearer ${token}`,
        },
        validateStatus: function (status) {
          return status < 500;
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default testApiCall;