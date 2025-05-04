import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PhotosPage from './pages/PhotosPage';
import PhotoDetailPage from './pages/PhotoDetailPage';
import PhotoUploadPage from './pages/PhotoUploadPage';
import AlbumsPage from './pages/AlbumsPage';
import AlbumDetailPage from './pages/AlbumDetailPage';
import AlbumFormPage from './pages/AlbumFormPage';
import NotFoundPage from './pages/NotFoundPage';
import AddPhotosToAlbumPage from './pages/AddPhotos';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/photos" element={<PhotosPage />} />
              <Route path="/photos/:id" element={<PhotoDetailPage />} />
              <Route path="/upload" element={<PhotoUploadPage />} />
              <Route path="/albums" element={<AlbumsPage />} />
              <Route path="/albums/new" element={<AlbumFormPage />} />
              <Route path="/albums/:id" element={<AlbumDetailPage />} />
              <Route path="/albums/:id/edit" element={<AlbumFormPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/albums/:id/add-photos" element={<AddPhotosToAlbumPage />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
};
export default App;
