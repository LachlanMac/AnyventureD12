import React, { useState, useRef } from 'react';
import Button from '../ui/Button';

interface CampaignPictureUploaderProps {
  currentPicture?: string;
  onPictureChange: (file: File | null) => void;
  size?: 'small' | 'medium' | 'large';
}

const CampaignPictureUploader: React.FC<CampaignPictureUploaderProps> = ({
  currentPicture,
  onPictureChange,
  size = 'large',
}) => {
  const [preview, setPreview] = useState<string | null>(
    currentPicture ? `/uploads/campaigns/${currentPicture}` : null
  );
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine dimensions based on size prop
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: '120px', height: '80px' };
      case 'medium':
        return { width: '180px', height: '120px' };
      case 'large':
      default:
        return { width: '240px', height: '160px' };
    }
  };

  const dimensions = getDimensions();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Call the parent component's handler
    onPictureChange(file);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle remove picture
  const handleRemovePicture = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onPictureChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div
        style={{
          position: 'relative',
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: '0.5rem',
          overflow: 'hidden',
          backgroundColor: 'var(--color-dark-elevated)',
          border: '1px solid var(--color-dark-border)',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleUploadClick}
      >
        {/* Display preview or placeholder */}
        {preview ? (
          <img
            src={preview}
            alt="Campaign picture"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isHovering ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: 'var(--color-cloud)',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ width: '2rem', height: '2rem', marginBottom: '0.5rem' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
              />
            </svg>
            <span style={{ fontSize: '0.75rem' }}>Upload Campaign Picture</span>
          </div>
        )}

        {/* Overlay when hovering */}
        {isHovering && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--color-white)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ width: '1.5rem', height: '1.5rem', margin: '0 auto 0.5rem' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>{preview ? 'Change Picture' : 'Upload Picture'}</span>
            </div>
          </div>
        )}

        {/* Remove button */}
        {preview && (
          <button
            onClick={handleRemovePicture}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '14px',
              opacity: isHovering ? 1 : 0.7,
              transition: 'opacity 0.2s',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
      />

      {/* Button to trigger file selection */}
      <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <Button variant="secondary" size="sm" onClick={handleUploadClick}>
            {preview ? 'Change Picture' : 'Upload Picture'}
          </Button>
          {preview && (
            <Button variant="secondary" size="sm" onClick={handleRemovePicture}>
              Remove
            </Button>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mt-2 text-center">
        Max size: 5MB. Supported: JPG, PNG, GIF, WebP
      </p>
    </div>
  );
};

export default CampaignPictureUploader;