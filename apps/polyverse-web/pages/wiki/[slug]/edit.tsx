import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface WikiPage {
  id: string;
  slug: string;
  title: string;
  content: string;
}

const WikiEditPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [page, setPage] = useState<WikiPage | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetch(`/api/wiki/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error('Page not found');
          return res.json();
        })
        .then(data => {
          setPage(data);
          setTitle(data.title);
          setContent(data.latestRevision?.content || data.content);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/wiki/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          authorDid: 'demo-user', // TODO: Get from auth context
          citations: [] // TODO: Add citation support
        })
      });

      if (response.ok) {
        router.push(`/wiki/${slug}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save page');
      }
    } catch (err) {
      setError('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Edit {page?.title}</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            required
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        
        {error && <div className="error">{error}</div>}
      </form>

      <style jsx>{`
        form {
          max-width: 800px;
          margin: 2rem 0;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        
        input, textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: inherit;
        }
        
        textarea {
          resize: vertical;
        }
        
        button {
          padding: 0.75rem 1.5rem;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
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
      `}</style>
    </div>
  );
};

export default WikiEditPage;