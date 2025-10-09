import { useState, useRef } from 'react';

interface MediaUploadProps {
  onUploadComplete: (mediaId: string, metadata: any) => void;
  onError: (error: string) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onUploadComplete, onError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      onError('Unsupported file type. Please upload a video or image file.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      onError('File too large. Maximum size is 100MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned URL from media service
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { mediaId, uploadUrl, metadata } = await response.json();

      // Step 2: Upload file directly to S3/MinIO using presigned URL
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          onUploadComplete(mediaId, metadata);
        } else {
          onError('Upload failed');
        }
        setIsUploading(false);
      });

      xhr.addEventListener('error', () => {
        onError('Upload failed');
        setIsUploading(false);
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

    } catch (error) {
      console.error('Upload error:', error);
      onError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="media-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <button
        type="button"
        onClick={triggerFileInput}
        disabled={isUploading}
        className="upload-button"
      >
        {isUploading ? 'Uploading...' : 'Upload Media'}
      </button>

      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span>{uploadProgress}%</span>
        </div>
      )}

      <style jsx>{`
        .media-upload {
          margin: 1rem 0;
        }

        .upload-button {
          background: #1976d2;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .upload-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .upload-button:hover:not(:disabled) {
          background: #1565c0;
        }

        .upload-progress {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #4caf50;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default MediaUpload;