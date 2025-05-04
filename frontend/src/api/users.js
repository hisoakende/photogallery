import client from './client';

/**
 * Получение всех пользователей с пагинацией
 */
export const getAllUsers = async (skip = 0, limit = 100) => {
  const response = await client.get(`/api/v1/users?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Получение пользователя по ID
 */
export const getUserById = async (id) => {
  const response = await client.get(`/api/v1/users/${id}`);
  return response.data;
};

/**
 * Получение текущего пользователя
 */
export const getCurrentUser = async () => {
  const response = await client.get('/api/v1/users/me');
  return response.data;
};

/**
 * Обновление профиля текущего пользователя
 */
export const updateUserProfile = async (data) => {
  const response = await client.put('/api/v1/users/me', data);
  
  // Обновляем пользователя в локальном хранилище
  const user = localStorage.getItem('user');
  if (user) {
    const updatedUser = {
      ...JSON.parse(user),
      ...response.data
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  
  return response.data;
};

/**
 * Удаление профиля текущего пользователя
 */
export const deleteUserProfile = async () => {
  await client.delete('/api/v1/users/me');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Обновление пароля пользователя
 * Примечание: В вашем API нет специального эндпоинта для смены пароля,
 * поэтому используем общий эндпоинт обновления профиля
 */
export const updatePassword = async (newPassword) => {
  const response = await client.put('/api/v1/users/me', {
    password: newPassword
  });
  return response.data;
};

/**
 * Загрузка фото профиля
 * Примечание: В вашем API нет специального эндпоинта для загрузки фото профиля,
 * поэтому эта функция является примером и может потребовать изменений
 */
export const uploadAvatar = async (file) => {
  // Этот эндпоинт не описан в спецификации API
  console.warn("uploadAvatar: API не поддерживает загрузку аватара");
  return null;
};
