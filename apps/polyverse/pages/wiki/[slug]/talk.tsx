import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface TalkPost {
  id: string;
  page_id: string;
  author_did: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  author?: {
    did: string;
    name?: string;
  };
}

const WikiTalkPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [posts, setPosts] = useState<TalkPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetch(`/api/wiki/${slug}/talk`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load discussion');
          return res.json();
        })
        .then(data => setPosts(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setError('');

    try {
      const response = await fetch(`/api/wiki/${slug}/talk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPost,
          authorDid: 'demo-user', // TODO: Get from auth context
          parentId: null
        })
      });

      if (response.ok) {
        const newPostData = await response.json();
        setPosts(prev => [newPostData, ...prev]);
        setNewPost('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to post message');
      }
    } catch (err) {
      setError('Failed to post message');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Discussion: {slug}</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="post">Add to discussion:</label>
          <textarea
            id="post"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={4}
            placeholder="Share your thoughts about this page..."
            required
          />
        </div>
        
        <button type="submit" disabled={posting}>
          {posting ? 'Posting...' : 'Post Message'}
        </button>
        
        {error && <div className="error">{error}</div>}
      </form>

      <div className="discussion">
        <h2>Discussion Thread</h2>
        
        {posts.length === 0 ? (
          <p>No discussion yet. Be the first to start the conversation!</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post">
              <div className="post-header">
                <strong>{post.author?.did}</strong>
                <span className="timestamp">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
              
              <div className="post-content">
                {post.content}
              </div>
              
              <hr />
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        form {
          margin: 2rem 0;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        
        textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: inherit;
          resize: vertical;
        }
        
        button {
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        button:hover:not(:disabled) {
          background: #1565c0;
        }
        
        .error {
          color: #d32f2f;
          margin-top: 1rem;
          padding: 0.5rem;
          background: #ffebee;
          border: 1px solid #d32f2f;
          border-radius: 4px;
        }
        
        .discussion {
          margin: 2rem 0;
        }
        
        .post {
          margin-bottom: 1rem;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }
        
        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .timestamp {
          color: #666;
          font-size: 0.9rem;
        }
        
        .post-content {
          line-height: 1.5;
        }
        
        hr {
          border: none;
          border-top: 1px solid #eee;
          margin: 1rem 0 0 0;
        }
      `}</style>
    </div>
  );
};

export default WikiTalkPage;