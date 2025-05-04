import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = ({ isDarkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            Галерея фотографий
          </Link>

          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/photos" className="nav-link">
              Фотографии
            </Link>
            <Link to="/albums" className="nav-link">
              Альбомы
            </Link>
            {user ? (
              <>
                <Link to="/upload" className="nav-link">
                  Загрузить
                </Link>
                <div className="user-menu">
                  <button className="user-menu-button">
                    <FiUser />
                    <span>{user.username}</span>
                  </button>
                  <div className="user-dropdown">
                    <button onClick={handleLogout} className="dropdown-item">
                      <FiLogOut /> Выйти
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Войти
                </Link>
                <Link to="/register" className="nav-link register-btn">
                  Зарегистрироваться
                </Link>
              </>
            )}
          </div>

          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </button>
            <button className="menu-toggle" onClick={toggleMenu}>
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
