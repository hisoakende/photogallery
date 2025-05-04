import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCamera, FiSearch, FiGrid, FiImage } from 'react-icons/fi';
import PhotoGrid from '../components/photos/PhotoGrid';
import AlbumGrid from '../components/albums/AlbumGrid';
import { getAllPhotos } from '../api/photos';
import { getAllAlbums } from '../api/albums';
import './HomePage.css';

const HomePage = () => {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
  const [photoError, setPhotoError] = useState(null);
  const [albumError, setAlbumError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingPhotos(true);
        const photoData = await getAllPhotos(0, 8);
        setPhotos(photoData);
      } catch (error) {
        console.error('Error fetching photos:', error);
        setPhotoError('Failed to load recent photos');
      } finally {
        setIsLoadingPhotos(false);
      }

      try {
        setIsLoadingAlbums(true);
        const albumData = await getAllAlbums(0, 4);
        setAlbums(albumData);
      } catch (error) {
        console.error('Error fetching albums:', error);
        setAlbumError('Failed to load featured albums');
      } finally {
        setIsLoadingAlbums(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Запечатлейте и поделитесь своими моментами</h1>
            <p>
            Храните, упорядочивайте и делитесь своими фотографиями с помощью нашей элегантной галерейной платформы. Создавайте альбомы, комментируйте снимки и открывайте для себя удивительные фотографии.
            </p>
            <div className="hero-actions">
              <Link to="/upload" className="btn btn-primary">
                <FiCamera /> Загрузить фотографию
              </Link>
              <Link to="/photos" className="btn btn-secondary">
                <FiSearch /> Исследовать галерею
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent photos section */}
      <section className="recent-photos">
        <div className="container">
          <div className="section-header">
            <h2>Недавние фотографии</h2>
            <Link to="/photos" className="section-link">
              Посмотреть все
            </Link>
          </div>
          <PhotoGrid 
            photos={photos} 
            loading={isLoadingPhotos} 
            error={photoError} 
          />
        </div>
      </section>

      {/* Featured albums section */}
      <section className="featured-albums">
        <div className="container">
          <div className="section-header">
            <h2>Лучшие альбомы</h2>
            <Link to="/albums" className="section-link">
              Посмотреть все
            </Link>
          </div>
          <AlbumGrid 
            albums={albums} 
            loading={isLoadingAlbums} 
            error={albumError} 
          />
        </div>
      </section>

      {/* Features section */}
      <section className="features">
        <div className="container">
          <h2 className="features-title">Make the Most of Your Photos</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <FiImage />
              </div>
              <h3>Unlimited Photo Storage</h3>
              <p>
                Upload and securely store all your precious moments in high quality.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FiGrid />
              </div>
              <h3>Organize with Albums</h3>
              <p>
                Create public or private albums to organize your photos by events, trips, or themes.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FiSearch />
              </div>
              <h3>Smart Search</h3>
              <p>
                Find exactly what you're looking for with our powerful search and filter tools.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
