import React, { useState } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import './AlbumSearch.css';

const AlbumSearch = ({ onSearch }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    title: '',
    is_private: null,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrivacyChange = (value) => {
    setSearchParams(prev => ({
      ...prev,
      is_private: value
    }));
  };

  const handleReset = () => {
    setSearchParams({
      title: '',
      is_private: null,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    onSearch({
      title: '',
      is_private: null,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <div className="album-search">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            name="title"
            value={searchParams.title}
            onChange={handleInputChange}
            placeholder="Найти альбомы..."
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <FiSearch />
          </button>
          <button
            type="button"
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
          </button>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-header">
              <h3>Сортировка</h3>
              <button
                type="button"
                className="close-filter"
                onClick={() => setShowFilters(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="filter-content">
              <div className="filter-group">
                <label htmlFor="sort_by">Сортировка по</label>
                <select
                  id="sort_by"
                  name="sort_by"
                  value={searchParams.sort_by}
                  onChange={handleInputChange}
                  className="select-input"
                >
                  <option value="created_at">Дате создания</option>
                  <option value="title">Заголовку</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="sort_order">Порядок сортировки</label>
                <select
                  id="sort_order"
                  name="sort_order"
                  value={searchParams.sort_order}
                  onChange={handleInputChange}
                  className="select-input"
                >
                  <option value="desc">Сначала новые</option>
                  <option value="asc">Сначала старые</option>
                </select>
              </div>

              <div className="filter-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleReset}
                >
                  Отменить
                </button>
                <button type="submit" className="btn-primary">
                  Применить
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AlbumSearch;
