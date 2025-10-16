import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Create the context
export const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth check

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const config = { headers: { 'x-auth-token': token } };
          const res = await axios.get('/api/auth/user', config);
          setUser(res.data); // Set user data if token is valid
        } catch (error) {
          console.error('Auth Error:', error);
          localStorage.removeItem('token'); // Remove invalid token
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};