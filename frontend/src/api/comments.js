import client from './client';

/**
 * Получение комментариев к фотографии
 */
export const getPhotoComments = async (photoId, skip = 0, limit = 100) => {
  const response = await client.get(`/api/v1/comments/photo/${photoId}?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Создание нового комментария
 */
export const createComment = async (photoId, text) => {
  const response = await client.post('/api/v1/comments', {
    photo_id: photoId,
    text
  });
  return response.data;
};

/**
 * Обновление комментария
 */
export const updateComment = async (commentId, text) => {
  const response = await client.put(`/api/v1/comments/${commentId}`, {
    text
  });
  return response.data;
};

/**
 * Удаление комментария
 */
export const deleteComment = async (commentId) => {
  await client.delete(`/api/v1/comments/${commentId}`);
};
