import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser as apiGetCurrentUser } from '../api/auth';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = apiGetCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } catch (err) {
        console.error('Error getting current user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const { user: userData } = await apiLogin(username, password);
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.detail?.[0]?.msg || 
                     'Login failed. Please check your credentials and try again.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      updateUser,
      isAuthenticated: () => !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
