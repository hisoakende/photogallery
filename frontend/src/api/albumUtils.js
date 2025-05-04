/**
 * Получает URL изображения для превью альбома
 * @param {Object} album - объект альбома
 * @param {string} defaultImage - URL изображения по умолчанию
 * @returns {string} - URL изображения для превью
 */
export const getAlbumPreviewImage = (album, defaultImage = '/default-album.jpg') => {
    // Проверяем наличие фотографий в альбоме
    console.log(album.photos);
    console.log(album);
    console.log("ABOBA");
    if (!album.photos || album.photos.length === 0) {
      return defaultImage;
    }
    
    // Выбираем случайную фотографию из альбома
    const randomIndex = Math.floor(Math.random() * album.photos.length);
    return "http://localhost:8000/" + album.photos[randomIndex].file_path;
  };
  