import client from './client';

/**
 * Вход пользователя для получения токена доступа
 */
export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await client.post('/api/v1/users/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  // Сохраняем токен в локальное хранилище
  localStorage.setItem('token', response.data.access_token);
  
  // Получаем данные пользователя
  const userResponse = await client.get('/api/v1/users/me');
  localStorage.setItem('user', JSON.stringify(userResponse.data));
  
  return {
    token: response.data.access_token,
    user: userResponse.data
  };
};

/**
 * Регистрация нового пользователя
 */
export const register = async (userData) => {
  const response = await client.post('/api/v1/users', userData);
  return response.data;
};

/**
 * Выход пользователя
 */
export const logout = async () => {
  // API не имеет специального эндпоинта для выхода,
  // поэтому просто очищаем локальное хранилище
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Проверка аутентификации пользователя
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Получение текущего пользователя из локального хранилища
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
