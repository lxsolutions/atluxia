import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  mediaId: string;
  autoPlay?: boolean;
  controls?: boolean;
  width?: number;
  height?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mediaId,
  autoPlay = false,
  controls = true,
  width = 640,
  height = 360,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manifestUrl, setManifestUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadVideo = async () => {
      if (!mediaId) return;

      setIsLoading(true);
      setError('');

      try {
        // Get media metadata
        const metaResponse = await fetch(`/api/media/${mediaId}/meta`);
        if (!metaResponse.ok) {
          throw new Error('Failed to load media metadata');
        }

        const metadata = await metaResponse.json();

        if (metadata.status !== 'ready') {
          throw new Error('Media is still processing');
        }

        // Use HLS.js for HLS playback if available
        const manifestUrl = `http://localhost:3006/media/${mediaId}/manifest.m3u8`;
        setManifestUrl(manifestUrl);

      } catch (err) {
        console.error('Video loading error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [mediaId]);

  useEffect(() => {
    if (!manifestUrl || !videoRef.current) return;

    // Check if browser supports HLS natively
    const video = videoRef.current;
    const canPlayHLS = video.canPlayType('application/vnd.apple.mpegurl');

    if (canPlayHLS) {
      // Native HLS support (Safari, iOS)
      video.src = manifestUrl;
    } else {
      // Load HLS.js for other browsers
      const loadHLS = async () => {
        try {
          // @ts-ignore - HLS.js will be loaded dynamically
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: false,
              lowLatencyMode: true,
              backBufferLength: 90,
            });
            
            hls.loadSource(manifestUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (autoPlay) {
                video.play().catch(console.error);
              }
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error('HLS error:', data);
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hls.recoverMediaError();
                    break;
                  default:
                    setError('Video playback error');
                    hls.destroy();
                    break;
                }
              }
            });
          } else {
            setError('HLS not supported in this browser');
          }
        } catch (err) {
          console.error('HLS.js loading error:', err);
          setError('Failed to load video player');
        }
      };

      loadHLS();
    }

    return () => {
      // Cleanup HLS instance if it exists
      if (videoRef.current && videoRef.current.hls) {
        videoRef.current.hls.destroy();
      }
    };
  }, [manifestUrl, autoPlay]);

  if (isLoading) {
    return (
      <div className="video-player loading">
        <div className="loading-spinner">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        width={width}
        height={height}
        controls={controls}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
      />
      
      <style jsx>{`
        .video-player {
          position: relative;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }

        .video-player.loading,
        .video-player.error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: ${height}px;
          color: white;
          font-size: 1.1rem;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .loading-spinner::before {
          content: '';
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .error-message {
          text-align: center;
          padding: 2rem;
        }

        video {
          display: block;
          max-width: 100%;
          height: auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Extend HTMLVideoElement to include hls property
declare global {
  interface HTMLVideoElement {
    hls?: any;
  }
}

export default VideoPlayer;