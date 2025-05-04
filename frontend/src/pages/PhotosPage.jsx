import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUpload, FiUser, FiGrid } from 'react-icons/fi';
import PhotoGrid from '../components/photos/PhotoGrid';
import { getAllPhotos, getMyPhotos } from '../api/photos';
import { useAuth } from '../contexts/AuthContext';
import './PhotosPage.css';

const PhotosPage = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  useEffect(() => {
    // Reset state when tab changes
    setPage(0);
    setPhotos([]);
    setHasMore(true);
    setLoading(true);
    setError(null);
    loadPhotos(0);
  }, [activeTab]);

  const loadPhotos = async (pageNum) => {
    try {
      setLoading(true);
      const skip = pageNum * pageSize;
      
      const newPhotos = activeTab === 'all' 
        ? await getAllPhotos(skip, pageSize)
        : await getMyPhotos(skip, pageSize);
      
      if (pageNum === 0) {
        setPhotos(newPhotos);
      } else {
        setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
      }
      
      // If we got less than the page size, there are no more to load
      setHasMore(newPhotos.length === pageSize);
    } catch (err) {
      console.error('Error loading photos:', err);
      setError('Failed to load photos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPhotos(nextPage);
  };

  return (
    <div className="photos-page">
      <div className="container">
        <div className="page-header">
          <h1>Галерея</h1>
          <div className="page-actions">
            {user && (
              <Link to="/upload" className="btn btn-primary">
                <FiUpload /> Загрузить
              </Link>
            )}
          </div>
        </div>

        {user && (
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <FiGrid /> Все фотографии
            </button>
            <button 
              className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
              onClick={() => setActiveTab('my')}
            >
              <FiUser /> Мои фотографии
            </button>
          </div>
        )}

        <PhotoGrid photos={photos} loading={loading && page === 0} error={error} />
        
        {!loading && !error && photos.length === 0 && (
          <div className="empty-state">
            <h3>No photos found</h3>
            {activeTab === 'my' ? (
              <>
                <p>You haven't uploaded any photos yet.</p>
                <Link to="/upload" className="btn btn-primary">
                  Upload Your First Photo
                </Link>
              </>
            ) : (
              <p>Be the first to share your amazing photos with the world!</p>
            )}
          </div>
        )}
        
        {hasMore && photos.length > 0 && (
          <div className="load-more-container">
            <button 
              className="btn btn-secondary load-more"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Photos'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotosPage;
