import { useState, useEffect, useContext, createContext } from 'react';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  register as apiRegister,
  isAuthenticated,
  getCurrentUser
} from '../api/auth';

// Создаем контекст авторизации
const AuthContext = createContext();

// Создаем провайдер компонент
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверяем существующего пользователя при монтировании компонента
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        setUser(getCurrentUser());
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Функция входа
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiLogin(username, password);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.detail?.[0]?.msg || 
                     'Login failed. Please check your credentials and try again.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция выхода
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

  // Функция регистрации
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRegister(userData);
      return data;
    } catch (err) {
      const message = err.response?.data?.detail?.[0]?.msg || 
                     'Registration failed. Please check your information and try again.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Обновление информации о пользователе в контексте после изменения профиля
  const updateUserInfo = (updatedUser) => {
    setUser({
      ...user,
      ...updatedUser
    });
    
    // Обновляем также в локальном хранилище
    localStorage.setItem('user', JSON.stringify({
      ...getCurrentUser(),
      ...updatedUser
    }));
  };

  // Создаем объект значения для контекста
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateUserInfo,
    isAuthenticated: () => !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Создаем хук для использования контекста авторизации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
