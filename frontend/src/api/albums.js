import client from './client';

/**
 * Получение всех альбомов с пагинацией
 */
export const getAllAlbums = async (skip = 0, limit = 100) => {
  const response = await client.get(`/api/v1/albums?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Получение альбомов текущего пользователя
 */
export const getMyAlbums = async (skip = 0, limit = 100) => {
  const response = await client.get(`/api/v1/albums/my?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Получение конкретного альбома по ID
 */
export const getAlbum = async (id) => {
  const response = await client.get(`/api/v1/albums/${id}`);
  return response.data;
};

/**
 * Создание нового альбома
 */
export const createAlbum = async (data) => {
  const response = await client.post('/api/v1/albums', data);
  return response.data;
};

/**
 * Обновление альбома
 */
export const updateAlbum = async (id, data) => {
  const response = await client.put(`/api/v1/albums/${id}`, data);
  return response.data;
};

/**
 * Удаление альбома
 */
export const deleteAlbum = async (id) => {
  await client.delete(`/api/v1/albums/${id}`);
};

/**
 * Поиск альбомов по параметрам
 */
export const searchAlbums = async (params) => {
  const queryParams = new URLSearchParams();
  
  // Добавляем каждый параметр в строку запроса, если он существует
  if (params.title) queryParams.append('title', params.title);
  if (params.user_id) queryParams.append('user_id', params.user_id);
  if (params.is_private !== undefined) queryParams.append('is_private', params.is_private);
  if (params.created_after) queryParams.append('created_after', params.created_after.toISOString());
  if (params.created_before) queryParams.append('created_before', params.created_before.toISOString());
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);
  if (params.skip !== undefined) queryParams.append('skip', params.skip);
  if (params.limit !== undefined) queryParams.append('limit', params.limit);
  
  const response = await client.get(`/api/v1/albums/search/?${queryParams.toString()}`);
  return response.data;
};

/**
 * Получение альбомов пользователя
 * Примечание: В вашем API нет прямого эндпоинта для получения альбомов пользователя по ID,
 * поэтому используем поиск с параметром user_id
 */
export const getUserAlbums = async (userId, skip = 0, limit = 100) => {
  const response = await searchAlbums({
    user_id: userId,
    skip,
    limit
  });
  return response;
};

// В файл src/api/albums.js добавим:

/**
 * Добавить фотографию в альбом
 */
export const addPhotoToAlbum = async (albumId, photoId) => {
    const response = await client.post(`/api/v1/photos/${photoId}/albums/${albumId}`);
    return response.data;
  };
  
  /**
   * Получить фотографии, которые можно добавить в альбом 
   * (фотографии пользователя, которые ещё не в альбоме)
   */
  export const getAvailablePhotosForAlbum = async (albumId) => {
    // Получаем все фотографии пользователя
    const userPhotos = await client.get('/api/v1/photos/my');
    
    // Получаем альбом с фотографиями
    const album = await client.get(`/api/v1/albums/${albumId}`);
    
    // Фильтруем фотографии, которые еще не в альбоме
    const albumPhotoIds = album.data.photos.map(photo => photo.id);
    const availablePhotos = userPhotos.data.filter(photo => !albumPhotoIds.includes(photo.id));
    
    return availablePhotos;
  };
  

  // В файле api/albums.js
/**
 * Удалить фотографию из альбома
 */
export const removePhotoFromAlbum = async (photoId, albumId) => {
    const response = await client.delete(`/api/v1/photos/${photoId}/albums/${albumId}`);
    return response.data;
  };
  