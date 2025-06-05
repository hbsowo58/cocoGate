import React, { createContext, useContext, useState, useEffect } from 'react';

const ApiKeyContext = createContext();

export const ApiKeyProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('');
  const [user, setUser] = useState(null);

  // Load user and API key from localStorage on initial load
  useEffect(() => {
    // Load user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('user');
      }
    }
    
    // Load API key
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Update localStorage when user or API key changes
  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  // Update API key in both context and localStorage
  const updateApiKey = (key) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('apiKey', key);
    } else {
      localStorage.removeItem('apiKey');
    }
  };

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey, 
      setApiKey: updateApiKey,
      user,
      setUser: updateUser
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => useContext(ApiKeyContext);