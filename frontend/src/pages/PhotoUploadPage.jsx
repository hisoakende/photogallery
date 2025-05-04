import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { uploadPhoto } from '../api/photos';
import { useAuth } from '../contexts/AuthContext';
import './PhotoUploadPage.css';

const PhotoUploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Проверка аутентификации пользователя
  if (!user) {
    navigate('/login', { state: { from: '/photos/upload' } });
    return null;
  }

  // Обработчик изменения файла
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Проверка типа файла
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Проверка размера файла (макс. 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size should not exceed 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Создание превью изображения
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Очистка выбранного файла
  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  // Создание имитации загрузки для демонстрации прогресса
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress > 95) {
        clearInterval(interval);
        progress = 95; // Остановимся на 95%, последние 5% - после получения ответа от сервера
      }
      setUploadProgress(progress);
    }, 300);
    
    return interval;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image to upload');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a title for your photo');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);
      
      // Имитация прогресса загрузки
      const progressInterval = simulateProgress();
      
      // Загрузка фото на сервер
      const uploadedPhoto = await uploadPhoto(file, title, description);
      
      // Завершение прогресса
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Перенаправление на страницу загруженного фото
      setTimeout(() => {
        navigate(`/`);
      }, 500);
      
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
      
      // Вывод подробной ошибки в консоль
      console.error('Upload error:', err.response?.data || err.message || err);
      
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Функция для отслеживания изменений в полях ввода
  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1 className="upload-title">Загрузить фотографию</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="upload-section">
            {!preview ? (
              <div 
                className="upload-dropzone"
                onClick={() => document.getElementById('photo-upload').click()}
              >
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <FiImage className="upload-icon" />
                <h3>Кликните, чтобы выбрать фотографию</h3>
                <p>Форматы: JPEG, PNG, GIF</p>
                <p>Максимальный размер: 10MB</p>
              </div>
            ) : (
              <div className="preview-container">
                <img
                  src={preview}
                  alt="Preview"
                  className="preview-image"
                />
                <button 
                  type="button" 
                  className="clear-button"
                  onClick={clearFile}
                  title="Remove image"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>
          
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title">Заголовок *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => handleInputChange(e, setTitle)}
                placeholder="Дайте заголовок"
                required
                maxLength="100"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Описания (опционально)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => handleInputChange(e, setDescription)}
                placeholder="Дайте описание"
                rows="4"
                maxLength="1000"
                disabled={loading}
              ></textarea>
            </div>
            
            {loading && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="progress-text">{uploadProgress}% Uploaded</div>
              </div>
            )}
            
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="button button-secondary"
                disabled={loading}
              >
                Отменить
              </button>
              
              <button
                type="submit"
                className="button button-primary"
                disabled={loading || !file || !title.trim()}
              >
                {loading ? 'Uploading...' : <><FiUpload /> Загрузить фотографию</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotoUploadPage;
