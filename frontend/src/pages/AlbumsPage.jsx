import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUser, FiGrid } from 'react-icons/fi';
import AlbumGrid from '../components/albums/AlbumGrid';
import AlbumSearch from '../components/albums/AlbumSearch';
import { getAllAlbums, getMyAlbums, searchAlbums } from '../api/albums';
import { useAuth } from '../contexts/AuthContext';
import './AlbumsPage.css';

const AlbumsPage = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchMode, setSearchMode] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  useEffect(() => {
    if (searchMode) return;
    
    // Reset state when tab changes
    setAlbums([]);
    setLoading(true);
    setError(null);
    loadAlbums();
  }, [activeTab, searchMode]);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      
      const fetchedAlbums = activeTab === 'all' 
        ? await getAllAlbums(0, 100)
        : await getMyAlbums(0, 100);
      
      setAlbums(fetchedAlbums);
    } catch (err) {
      console.error('Error loading albums:', err);
      setError('Failed to load albums. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (params) => {
    try {
      setLoading(true);
      setSearchMode(true);
      setSearchParams(params);
      
      const searchResults = await searchAlbums(params);
      setAlbums(searchResults);
    } catch (err) {
      console.error('Error searching albums:', err);
      setError('Failed to search albums. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchMode(false);
    setSearchParams(null);
  };

  return (
    <div className="albums-page">
      <div className="container">
        <div className="page-header">
          <h1>Альбомы</h1>
          <div className="page-actions">
            {user && (
              <Link to="/albums/new" className="btn btn-primary">
                <FiPlus /> Создать альбом
              </Link>
            )}
          </div>
        </div>

        <div className="albums-controls">
          {user && (
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('all');
                  setSearchMode(false);
                }}
              >
                <FiGrid /> Все альбомы
              </button>
              <button 
                className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('my');
                  setSearchMode(false);
                }}
              >
                <FiUser /> Мои альбомы
              </button>
            </div>
          )}
          
          <AlbumSearch onSearch={handleSearch} />
        </div>

        {searchMode && (
          <div className="search-status">
            <div className="search-info">
              <span>Search results</span>
              {searchParams?.title && (
                <span className="search-term">"{searchParams.title}"</span>
              )}
            </div>
            <button className="btn-text" onClick={handleClearSearch}>
              Отчистить поиск
            </button>
          </div>
        )}

        <AlbumGrid albums={albums} loading={loading} error={error} />
        
        {!loading && !error && albums.length === 0 && (
          <div className="empty-state">
            <h3>{searchMode ? 'No albums match your search' : 'No albums found'}</h3>
            {activeTab === 'my' && !searchMode ? (
              <>
                <p>You haven't created any albums yet.</p>
                <Link to="/albums/new" className="btn btn-primary">
                  Create Your First Album
                </Link>
              </>
            ) : searchMode ? (
              <p>Try adjusting your search criteria.</p>
            ) : (
              <p>No albums have been created yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumsPage;
