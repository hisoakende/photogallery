import client from './client';

/**
 * Получение всех фотографий с пагинацией
 */
export const getAllPhotos = async (skip = 0, limit = 100) => {
  const response = await client.get(`/api/v1/photos?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Получение фотографий текущего пользователя
 */
export const getMyPhotos = async (skip = 0, limit = 100) => {
  const response = await client.get(`/api/v1/photos/my?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Получение конкретной фотографии по ID
 */
export const getPhotoById = async (id) => {
  const response = await client.get(`/api/v1/photos/${id}`);
  return response.data;
};

/**
 * Загрузка новой фотографии
 */
export const uploadPhoto = async (file, title, description = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  
  if (description) {
    formData.append('description', description);
  }
  
  const response = await client.post('/api/v1/photos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Обновление информации о фотографии
 */
export const updatePhoto = async (id, data) => {
  const response = await client.put(`/api/v1/photos/${id}`, data);
  return response.data;
};

/**
 * Удаление фотографии
 */
export const deletePhoto = async (id) => {
  await client.delete(`/api/v1/photos/${id}`);
};

/**
 * Добавление фотографии в альбом
 */
export const addPhotoToAlbum = async (photoId, albumId) => {
  const response = await client.post(`/api/v1/photos/${photoId}/albums/${albumId}`);
  return response.data;
};

/**
 * Удаление фотографии из альбома
 */
export const removePhotoFromAlbum = async (photoId, albumId) => {
  const response = await client.delete(`/api/v1/photos/${photoId}/albums/${albumId}`);
  return response.data;
};

/**
 * Получение фотографий пользователя
 * Примечание: В вашем API нет прямого эндпоинта для получения фотографий по ID пользователя,
 * поэтому эта функция может потребовать изменений в зависимости от вашего API
 */
export const getUserPhotos = async (userId, skip = 0, limit = 100) => {
  console.warn("getUserPhotos: API не предоставляет прямой эндпоинт для получения фотографий по ID пользователя");
  // Альтернативно можно использовать фильтрацию всех фотографий, если API это поддерживает
  return [];
};
