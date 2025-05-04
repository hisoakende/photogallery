import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FiEdit2, FiGrid, FiBookmark, FiSettings } from 'react-icons/fi';
import { getUserById } from '../api/users';
import { searchAlbums } from '../api/albums';
import { getAllPhotos } from '../api/photos';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/ui/Modal';
import './ProfilePage.css';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [activeTab, setActiveTab] = useState('photos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Определить, является ли просматриваемый профиль профилем текущего пользователя
  const isCurrentUser = currentUser && user && currentUser.id === user.id;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Загрузка данных пользователя
        const userData = await getUserById(userId);
        setUser(userData);
        
        // Загрузка фотографий пользователя
        // Так как в API нет метода получения фотографий по ID пользователя,
        // загружаем все фото и фильтруем по user_id
        const allPhotos = await getAllPhotos(0, 100);
        const userPhotos = allPhotos.filter(photo => photo.user_id === parseInt(userId));
        setPhotos(userPhotos);
        
        // Загрузка альбомов пользователя
        const userAlbums = await searchAlbums({
          user_id: parseInt(userId),
          is_private: isCurrentUser ? undefined : false // Если не текущий пользователь, получаем только публичные альбомы
        });
        setAlbums(userAlbums);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isCurrentUser]);

  // Рендер при загрузке
  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Рендер при ошибке
  if (error || !user) {
    return (
      <div className="profile-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'User not found'}</p>
          <button 
            className="button button-primary" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Обработчик смены активной вкладки
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header-top">
          <div className="profile-avatar-container">
            {/* В API нет URL аватара, используем заглушку */}
            <img 
              src="/default-avatar.png" 
              alt={`${user.username}'s avatar`} 
              className="profile-avatar"
            />
          </div>
          
          <div className="profile-info">
            <div className="profile-username-container">
              <h1 className="profile-username">{user.username}</h1>
              
              {isCurrentUser ? (
                <button 
                  className="button button-outline"
                  onClick={() => setShowEditModal(true)}
                >
                  <FiEdit2 /> Edit Profile
                </button>
              ) : (
                <button className="button button-primary">
                  Follow
                </button>
              )}
            </div>
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-count">{photos.length}</span> photos
              </div>
              <div className="stat">
                <span className="stat-count">{albums.length}</span> albums
              </div>
              <div className="stat">
                <span className="stat-count">0</span> followers
              </div>
            </div>
            
            <div className="profile-details">
              <p className="profile-email">{user.email}</p>
              <p className="profile-joined">
                Joined {format(new Date(user.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => handleTabChange('photos')}
          >
            <FiGrid /> <span className="tab-text">Photos</span>
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => handleTabChange('albums')}
          >
            <FiBookmark /> <span className="tab-text">Albums</span>
          </button>
          
          {isCurrentUser && (
            <button 
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <FiSettings /> <span className="tab-text">Settings</span>
            </button>
          )}
        </div>
        
        <div className="tab-content">
          {activeTab === 'photos' && (
            <div className="photos-grid">
              {photos.length > 0 ? (
                photos.map(photo => (
                  <div key={photo.id} className="photo-item">
                    <Link to={`/photos/${photo.id}`} className="photo-link">
                      <img 
                        src={photo.file_path} 
                        alt={photo.title} 
                        className="photo-image"
                      />
                      <div className="photo-overlay">
                        <h3 className="photo-title">{photo.title}</h3>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No Photos Yet</h3>
                  {isCurrentUser && (
                    <Link to="/photos/upload" className="button button-primary">
                      Upload Your First Photo
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'albums' && (
            <div className="albums-grid">
              {albums.length > 0 ? (
                albums.map(album => (
                  <div key={album.id} className="album-item">
                    <Link to={`/albums/${album.id}`} className="album-link">
                      <div className="album-placeholder">
                        <FiBookmark size={24} />
                      </div>
                      <div className="album-details">
                        <h3 className="album-title">{album.title}</h3>
                        <p className="album-date">
                          {format(new Date(album.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No Albums Yet</h3>
                  {isCurrentUser && (
                    <Link to="/albums/create" className="button button-primary">
                      Create Your First Album
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && isCurrentUser && (
            <div className="settings-section">
              <div className="settings-card">
                <h2 className="settings-title">Account Settings</h2>
                <ul className="settings-list">
                  <li>
                    <Link to="/settings/profile" className="settings-link">
                      Edit Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings/password" className="settings-link">
                      Change Password
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings/privacy" className="settings-link">
                      Privacy Settings
                    </Link>
                  </li>
                  <li>
                    <button className="settings-link danger">
                      Delete Account
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Модальное окно редактирования профиля */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <div className="edit-profile-form">
          <form>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                id="username" 
                type="text" 
                defaultValue={user.username}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                id="email" 
                type="email" 
                defaultValue={user.email}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="button button-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
