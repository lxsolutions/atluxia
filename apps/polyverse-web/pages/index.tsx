





import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import KeyManager from '../components/KeyManager';
import TransparencyPanel from '../components/TransparencyPanel';
import MediaUpload from '../components/MediaUpload';
import VideoPlayer from '../components/VideoPlayer';

interface KeyPair {
  publicKey: string;
  privateKey: string;
  did: string;
}

interface Event {
  id: string;
  kind: string;
  created_at: number;
  author_did: string;
  body: {
    text: string;
    mediaId?: string;
  };
  refs: any[];
  sig: string;
}

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('recency_follow');
  const [userKeys, setUserKeys] = useState<KeyPair | null>(null);
  const [transparencyPanel, setTransparencyPanel] = useState<{
    isOpen: boolean;
    postId: string;
    bundleId: string;
  }>({
    isOpen: false,
    postId: '',
    bundleId: ''
  });
  
  const [attachedMedia, setAttachedMedia] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  // Fetch events from relay based on selected algorithm
  useEffect(() => {
    fetch(`/api/events?algo=${encodeURIComponent(selectedAlgorithm)}`)
      .then(res => res.json())
      .then(data => setEvents(data));
  }, [selectedAlgorithm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userKeys) {
      alert('Please generate or import keys first');
      return;
    }

    await fetch('/api/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content: newPost,
        privateKey: userKeys.privateKey,
        did: userKeys.did,
        mediaId: attachedMedia || undefined
      })
    });

    // Refresh events
    fetch(`/api/events?algo=${encodeURIComponent(selectedAlgorithm)}`)
      .then(res => res.json())
      .then(data => setEvents(data));

    setNewPost('');
    setAttachedMedia('');
  };

  const handleMediaUploadComplete = (mediaId: string, metadata: any) => {
    setAttachedMedia(mediaId);
    setUploadError('');
    console.log('Media uploaded successfully:', mediaId, metadata);
  };

  const handleMediaUploadError = (error: string) => {
    setUploadError(error);
    console.error('Media upload error:', error);
  };

  return (
    <Layout title="PolyVerse - Home">
      <h1>PolyVerse Web Client</h1>

      <KeyManager onKeyChange={setUserKeys} />

      <div className="algorithm-selection">
        <label htmlFor="algo-select">Feed Algorithm:</label>
        <select
          id="algo-select"
          value={selectedAlgorithm}
          onChange={(e) => setSelectedAlgorithm(e.target.value)}
        >
          <option value="recency_follow">Recency + Follows</option>
          <option value="multipolar_diversity">Multipolar Diversity</option>
          <option value="locality_first">Locality First</option>
        </select>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's happening?"
        />
        
        <MediaUpload
          onUploadComplete={handleMediaUploadComplete}
          onError={handleMediaUploadError}
        />
        
        {uploadError && (
          <div className="error-message">{uploadError}</div>
        )}
        
        {attachedMedia && (
          <div className="media-preview">
            <VideoPlayer mediaId={attachedMedia} width={320} height={180} />
            <button 
              type="button" 
              className="remove-media"
              onClick={() => setAttachedMedia('')}
            >
              Remove
            </button>
          </div>
        )}
        
        <button type="submit">Post</button>
      </form>

      <div className="events">
        {events.map(event => (
          <div key={event.id} className="event">
            <p>{event.body.text}</p>
            {event.body.mediaId && (
              <div className="event-media">
                <VideoPlayer mediaId={event.body.mediaId} width={400} height={225} />
              </div>
            )}
            <button 
              className="transparency-button"
              onClick={() => setTransparencyPanel({
                isOpen: true,
                postId: event.id,
                bundleId: selectedAlgorithm
              })}
            >
              Why this post?
            </button>
          </div>
        ))}
      </div>

      <TransparencyPanel
        isOpen={transparencyPanel.isOpen}
        postId={transparencyPanel.postId}
        bundleId={transparencyPanel.bundleId}
        onClose={() => setTransparencyPanel({ isOpen: false, postId: '', bundleId: '' })}
      />

      <style jsx>{`
        .algorithm-selection {
          margin: 1rem 0;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        .algorithm-selection label {
          margin-right: 0.5rem;
          font-weight: bold;
        }
        
        .algorithm-selection select {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        
        .events {
          margin-top: 2rem;
        }
        
        .event {
          border: 1px solid #ddd;
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 8px;
          background: white;
        }
        
        .event p {
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }
        
        .event-media {
          margin: 1rem 0;
        }
        
        .transparency-button {
          background: #1976d2;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .transparency-button:hover {
          background: #1565c0;
        }
        
        form {
          margin: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        form input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        
        form button {
          padding: 0.5rem 1rem;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          align-self: flex-start;
        }
        
        form button:hover {
          background: #1565c0;
        }
        
        .error-message {
          color: #d32f2f;
          background: #ffebee;
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ffcdd2;
          font-size: 0.9rem;
        }
        
        .media-preview {
          position: relative;
          margin: 0.5rem 0;
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .remove-media {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
          cursor: pointer;
        }
        
        .remove-media:hover {
          background: #d32f2f;
        }
      `}</style>
    </Layout>
  );
};

export default Home;


