import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add authentication headers
api.interceptors.request.use(config => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = userData?.token || localStorage.getItem('token');
    
    // For chat endpoints, we'll handle the Authorization header in the sendMessage function
    if (config.url.includes('/api/chat/')) {
      console.log('Chat endpoint request - skipping JWT token in interceptor');
      // Remove any existing JWT token for chat endpoints
    if (config.headers['Authorization']) {
      console.log('Removing existing Authorization header for chat endpoint');
      delete config.headers['Authorization'];
    }
      return config;
    }
    
    // For non-chat endpoints, add JWT token if available
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('JWT Token added to headers for non-chat endpoint');
    }

    // Add username header if available
    if (userData?.username) {
      config.headers['X-Username'] = userData.username;
      console.log('Username added to headers:', userData.username);
    }
    
    console.log('Request headers:', JSON.stringify(config.headers, null, 2));
    return config;
  } catch (error) {
    console.error('Interceptor error:', error);
    return Promise.reject(error);
  }
}, error => {
  console.error('Interceptor request error:', error);
  return Promise.reject(error);
});

/**
 * Send a message to the chat API
 * @param {string} message - The message to send
 * @param {Array} history - Chat history (optional)
 * @param {string} apiKey - The API key for authentication
 * @returns {Promise} Axios response
 */

export const sendMessage = async (message, history = []) => {
  try {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const username = userData?.username;
    const token = userData?.token;
    const apiKey = localStorage.getItem('apiKey') || userData?.apiKey;

    console.log('User data from localStorage:', { 
      username, 
      hasToken: !!token, 
      hasApiKey: !!apiKey 
    });

    if (!username || !token) {
      console.error('사용자 정보 없음 - 로그인 필요');
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
    }
    if (!apiKey) {
      console.error('API key is missing from user data');
      throw new Error('API 키를 찾을 수 없습니다. 설정에서 API 키를 등록해주세요.3');
    }

    // Create axios instance with proper headers
    const chatApi = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-API-Key': apiKey,
        'X-Username': username // 명시적으로 username을 헤더에 추가
      }
    });

    // Send chat message (username을 body에도 명시적으로 포함)
    const response = await chatApi.post('/api/chat/send', { 
      message,
      history,
      username // 서버에서 username 파라미터를 명확히 받도록 body에도 포함
    });

    // 토큰 갱신
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify({ ...userData, token: response.data.token }));
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
    
  } catch (error) {
    console.error('채팅 전송 오류:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Enhance error with more context
    if (!error.response) {
      error.isNetworkError = true;
      error.message = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
    } else if (error.response.status === 401) {
      error.message = '인증에 실패했습니다. 다시 로그인해주세요.';
    } else if (error.response.status === 403) {
      error.message = '접근 권한이 없습니다. API 키를 확인해주세요.';
    } else if (error.response.status === 400) {
      error.message = '잘못된 요청입니다. 입력값을 확인해주세요.';
    } else {
      error.message = error.response.data?.error || '채팅 전송에 실패했습니다.';
    }
    
    throw error;
  }
};

/**
 * Save the API key to the user's profile
 * @param {string} apiKey - The API key to save
 * @param {string} username - The username to associate with the API key
 * @returns {Promise} Axios response
 */
/**
 * Save the API key to the user's profile
 * @param {string} apiKey - The API key to save (must be a string)
 * @param {string} username - The username to associate with the API key
 * @returns {Promise} Axios response
 * @throws Will throw an error if apiKey is not a valid string or if the API call fails
 */
export const saveApiKey = async (apiKey, username) => {
  try {
    console.log(apiKey)
    // Validate input parameters
    if (typeof apiKey !== 'string') {
      const error = new Error('API 키는 반드시 문자열이어야 합니다.');
      error.code = 'INVALID_API_KEY_TYPE';
      throw error;
    }

    // Clean and validate the API key
    const cleanApiKey = apiKey.trim();
    
    // Additional validation
    if (!cleanApiKey) {
      const error = new Error('API 키를 입력해주세요.');
      error.code = 'EMPTY_API_KEY';
      throw error;
    }

    if (cleanApiKey.includes('function') || cleanApiKey.includes('=>')) {
      const error = new Error('잘못된 API 키 형식입니다. 함수가 전달되었습니다.');
      error.code = 'INVALID_API_KEY_FORMAT';
      throw error;
    }
    
    console.log(`[saveApiKey] Saving API key for user: ${username}`);
    console.log(`[saveApiKey] API key length: ${cleanApiKey.length}`);
    
    // Make the API request
    const response = await api.post(
      '/api/user/api-key', 
      { 
        apiKey: cleanApiKey 
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Username': username
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      }
    );

    console.log('[saveApiKey] API key saved successfully');
    return response.data;
    
  } catch (error) {
    console.error('[saveApiKey] Error saving API Key:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: error.stack
    });
    
    // Enhance the error with more context
    if (!error.response) {
      error.isNetworkError = true;
      error.message = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
    } else if (error.response.status === 401) {
      error.message = '인증에 실패했습니다. 다시 로그인해주세요.';
    } else if (error.response.status === 400) {
      error.message = '잘못된 요청입니다. 입력값을 확인해주세요.';
    }
    
    throw error;
  }
};

/**
 * Test the API connection with the provided API key
 * @param {string} apiKey - The API key to test (must be a valid string)
 * @param {string} username - The username for the API key
 * @returns {Promise} Axios response
 * @throws Will throw an error if the API key is invalid or the test fails
 */
export const testConnection = async (apiKey, username) => {
  try {
    // Validate input parameters
    if (typeof apiKey !== 'string' || !apiKey.trim()) {
      const error = new Error('유효한 API 키를 입력해주세요.');
      error.code = 'INVALID_API_KEY';
      throw error;
    }

    const cleanApiKey = apiKey.trim();

    // First, save the API key
    await saveApiKey(cleanApiKey, username);
    
    // Get JWT token from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.token;
    
    if (!token) {
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
    }

    // Create a new axios instance for testing to avoid header conflicts
    const testApi = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-API-Key': cleanApiKey
      }
    });

    // Make a test request
    const response = await testApi.post('/api/chat/test', 
      { message: "connection test" },
      {
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      }
    );

    console.log('[testConnection] Connection test successful');
    return response.data;

  } catch (error) {
    console.error('[testConnection] Connection test failed:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: error.stack
    });

    // Enhance the error with more context
    if (!error.response) {
      error.isNetworkError = true;
      error.message = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
    } else if (error.response.status === 401) {
      error.message = '인증에 실패했습니다. 로그인 상태를 확인해주세요.';
    } else if (error.response.status === 400) {
      error.message = '잘못된 요청입니다. 입력값을 확인해주세요.';
    } else if (error.response.status === 403) {
      error.message = '접근 권한이 없습니다. 관리자에게 문의해주세요.';
    } else if (error.response.status === 404) {
      error.message = '테스트 엔드포인트를 찾을 수 없습니다.';
    } else {
      error.message = error.response.data?.error || '연결 테스트에 실패했습니다.';
    }
    
    throw error;
  }
};

export default api;