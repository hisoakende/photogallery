import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';
import { uploadPhoto } from '../../api/photos';
import './PhotoUpload.css';

const PhotoUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  const removeFile = () => {
    setFile(null);
    setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!file) {
      setError('Please select an image to upload');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const photo = await uploadPhoto(title, description, file);
      navigate(`/photos/${photo.id}`);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload photo. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="photo-upload">
      <h1>Upload Photo</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your photo"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for your photo"
            rows="4"
          />
        </div>
        
        <div className="form-group">
          <label>Photo *</label>
          {!file ? (
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="dropzone-content">
                <FiUpload className="upload-icon" />
                <p>
                  {isDragActive
                    ? 'Drop the image here'
                    : 'Drag & drop an image here, or click to select'}
                </p>
                <span className="dropzone-info">
                  Accepted formats: JPG, PNG, GIF (max 10MB)
                </span>
              </div>
            </div>
          ) : (
            <div className="file-preview">
              <img src={preview} alt="Preview" className="preview-image" />
              <div className="preview-info">
                <div>
                  <strong>{file.name}</strong>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  onClick={removeFile}
                >
                  <FiX /> Remove
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhotoUpload;
