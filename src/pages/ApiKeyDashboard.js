import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import testApiCall from '../utils/testApi';

const ApiKeyDashboard = () => {
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  }, []);

// ApiKeyDashboard.js에서 fetchKeys 함수를 찾아 다음과 같이 수정해주세요
const fetchKeys = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('로그인이 필요합니다.', 'error');
      return;
    }

    const response = await axios.get(
      `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/keys`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 응답 데이터에서 isActive와 active 필드가 모두 있는지 확인
    const formattedKeys = response.data.map(key => ({
      ...key,
      // isActive가 없으면 active 값을, active도 없으면 true를 기본값으로 사용
      isActive: key.isActive !== undefined ? key.isActive : (key.active !== undefined ? key.active : true),
      // active 필드도 동일하게 설정
      active: key.active !== undefined ? key.active : (key.isActive !== undefined ? key.isActive : true)
    }));

    setKeys(formattedKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    showNotification('API 키 목록을 불러오는 중 오류가 발생했습니다.', 'error');
  }
}, [showNotification]);

const toggleKeyStatus = useCallback(async (keyId, currentStatus) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('로그인이 필요합니다.', 'error');
      return;
    }

    // 1. 즉시 UI 업데이트 (낙관적 업데이트)
    setKeys(prevKeys => 
      prevKeys.map(key => 
        key.id === keyId 
          ? { ...key, isActive: !currentStatus, active: !currentStatus }
          : key
      )
    );

    // 2. API 호출
    await axios.put(
      `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/keys/${keyId}/toggle`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 3. 서버에서 최신 상태를 다시 가져옴
    await fetchKeys();
    showNotification(`API 키가 ${!currentStatus ? '활성화' : '비활성화'}되었습니다.`, 'success');

  } catch (error) {
    console.error('Error toggling API key status:', error);
    // 에러 발생 시 원래 상태로 복구
    await fetchKeys();
    showNotification(
      error.response?.data?.error || 'API 키 상태를 변경하는 중 오류가 발생했습니다.',
      'error'
    );
  }
}, [showNotification, fetchKeys]);

  const deleteKey = useCallback(async (keyId) => {
    if (!window.confirm('정말 이 API 키를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('로그인이 필요합니다.', 'error');
        return;
      }
      
      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/keys/${keyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      showNotification('API 키가 삭제되었습니다.', 'success');
      fetchKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      showNotification(
        `API 키 삭제 실패: ${error.response?.data?.message || error.message}`,
        'error'
      );
    }
  }, [showNotification, fetchKeys]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const generateKey = async () => {
    if (!newKeyName.trim()) {
      showNotification('키 이름을 입력해주세요', 'warning');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('로그인이 필요합니다.', 'error');
        return;
      }
      
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/keys`,
        null,
        {
          params: { name: newKeyName },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setKeys([...keys, { ...response.data, totalTokensUsed: 0 }]);
      setNewKeyName('');
      showNotification('새 API 키가 생성되었습니다.', 'success');
    } catch (error) {
      console.error('Error generating API key:', error);
      showNotification(`API 키 생성에 실패했습니다: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testWithApiKey = async (apiKey) => {
    if (!apiKey) {
      showNotification('API 키가 없습니다.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('로그인이 필요합니다.', 'error');
      return;
    }

    // Get username from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const username = userData?.username;
    
    if (!username) {
      showNotification('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.', 'error');
      return;
    }

    setTesting(true);
    try {
      // Call the test API and get the response with token usage
      const testResult = await testApiCall(apiKey, token, username);
      
      // Find the API key ID from the keys list
      const apiKeyInfo = keys.find(key => key.key === apiKey);
      if (!apiKeyInfo) {
        throw new Error('API 키 정보를 찾을 수 없습니다.');
      }
      
      // Update token usage in the backend
      if (testResult.tokenUsage) {
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/keys/usage`,
          {
            keyId: apiKeyInfo.id, // Use the database ID, not the API key itself
            tokensUsed: testResult.tokenUsage.total,
            operation: 'test'
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'X-Username': username // Add username to headers for backend validation
            }
          }
        );
      }
      
      // Refresh the keys list
      await fetchKeys();
      
      // Show success message with token usage
      showNotification(
        `✅ 테스트 성공! (사용된 토큰: ${testResult.tokenUsage?.total || 0}개)`,
        'success'
      );
    } catch (error) {
      console.error('API test failed:', error);
      showNotification(
        `❌ 테스트 실패: ${error.response?.data?.message || error.message}`,
        'error'
      );
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">API 키 관리 대시보드</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="새 키 이름을 입력하세요"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateKey()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={generateKey}
              disabled={loading}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {loading ? '생성 중...' : '새 키 생성'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API 키</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">토큰 사용량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요청 횟수</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마지막 사용</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keys.map((keyItem) => (
                  <tr key={keyItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {keyItem.name || '이름 없음'}
                      {!keyItem.isActive && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">{keyItem.key.substring(0, 8)}...{keyItem.key.substring(keyItem.key.length - 4)}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(keyItem.key);
                            showNotification('API 키가 클립보드에 복사되었습니다.', 'success');
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="클립보드에 복사"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {keyItem.tokensUsed?.toLocaleString() || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {keyItem.requestCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {keyItem.lastUsedAt 
                        ? new Date(keyItem.lastUsedAt).toLocaleString() 
                        : '사용 이력 없음'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        keyItem.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {keyItem.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => testWithApiKey(keyItem.key)}
                        disabled={testing}
                        className={`px-3 py-1 text-sm rounded ${
                          testing 
                            ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                        title="API 키 테스트"
                      >
                        {testing ? '테스트 중...' : '테스트'}
                      </button>
                      <button
                        onClick={() => toggleKeyStatus(keyItem.id, keyItem.isActive)}
                        className={`px-3 py-1 text-sm rounded ${
                          keyItem.isActive
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={keyItem.isActive ? '비활성화' : '활성화'}
                      >
                        {keyItem.isActive ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => deleteKey(keyItem.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        title="삭제"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${
          notification.type === 'error' ? 'bg-red-100 text-red-800' : 
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ApiKeyDashboard;