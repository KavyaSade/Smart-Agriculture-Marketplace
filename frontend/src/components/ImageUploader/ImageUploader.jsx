import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import './ImageUploader.css';

export default function ImageUploader({
  image,
  onImageChange,
  label = 'Upload Image',
  maxSizeMB = 2,
  maxDim = 500
}) {
  const [error, setError] = useState('');

  // Handle file selection and conversion to base64 with resizing
  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      setError('Please upload a PNG or JPG format photo only.');
      return;
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds the ${maxSizeMB}MB limit. Please choose a smaller photo.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize image if it exceeds max dimensions
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas back to jpeg/png data URL
        const dataUrl = canvas.toDataURL(file.type, 0.85);
        onImageChange(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Remove current image
  const handleRemove = () => {
    setError('');
    onImageChange('');
  };

  return (
    <div className="image-uploader-container">
      {label && <label className="image-uploader-label">{label}</label>}
      
      {error && <span className="image-uploader-error">{error}</span>}

      {!image ? (
        <div className="image-uploader-dropzone">
          <Upload size={20} className="image-uploader-icon" />
          <input 
            type="file" 
            accept="image/png, image/jpeg"
            className="image-uploader-file-input" 
            onChange={handleFileChange}
          />
          <span className="image-uploader-text">Choose PNG or JPG image</span>
        </div>
      ) : (
        <div className="image-uploader-preview-container">
          <img 
            src={image} 
            alt="Uploader preview" 
            className="image-uploader-preview-img" 
          />
          <button 
            type="button" 
            onClick={handleRemove}
            className="image-uploader-remove-btn"
            title="Remove Image"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
