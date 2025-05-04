import axios from 'axios';

// Базовый URL API
const API_BASE_URL = 'http://localhost:8000';

// Создаем экземпляр axios с базовым URL
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик запросов для добавления токена авторизации
client.interceptors.request.use(
  (config) => {
    // Получаем токен из локального хранилища
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов для обработки ошибок глобально
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обрабатываем ошибки аутентификации
    if (error.response && error.response.status === 401) {
      // Очищаем локальное хранилище
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Перенаправляем на страницу входа, если еще не там
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default client;
