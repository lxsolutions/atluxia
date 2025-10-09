import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface WikiPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  moderation_status: 'approved' | 'pending' | 'contested' | 'rejected';
  created_at: string;
  updated_at: string;
  latestRevision?: {
    content: string;
    author: {
      did: string;
      name?: string;
    };
    created_at: string;
  };
}

const WikiPageView = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [page, setPage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetch(`/api/wiki/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error('Page not found');
          return res.json();
        })
        .then(data => setPage(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!page) return <div>Page not found</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{page.title}</h1>
        {page.moderation_status !== 'approved' && (
          <span className={`moderation-badge ${page.moderation_status}`}>
            {page.moderation_status.toUpperCase()}
          </span>
        )}
      </div>
      
      <div className="wiki-actions">
        <Link href={`/wiki/${slug}/edit`}>
          <button>Edit</button>
        </Link>
        <Link href={`/wiki/${slug}/diff`}>
          <button>View History</button>
        </Link>
        <Link href={`/wiki/${slug}/talk`}>
          <button>Discussion</button>
        </Link>
      </div>

      <div className="wiki-content">
        <pre>{page.latestRevision?.content || page.content}</pre>
      </div>

      <div className="wiki-meta">
        <p>Last edited by {page.latestRevision?.author.did} on {new Date(page.latestRevision?.created_at || page.updated_at).toLocaleString()}</p>
      </div>

      <style jsx>{`
        .page-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .moderation-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .moderation-badge.pending {
          background: #ff9800;
          color: white;
        }
        
        .moderation-badge.contested {
          background: #f44336;
          color: white;
        }
        
        .moderation-badge.rejected {
          background: #9e9e9e;
          color: white;
        }
        
        .wiki-actions {
          margin: 1rem 0;
          display: flex;
          gap: 0.5rem;
        }
        
        .wiki-actions button {
          padding: 0.5rem 1rem;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .wiki-actions button:hover {
          background: #1565c0;
        }
        
        .wiki-content {
          margin: 2rem 0;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }
        
        .wiki-content pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.6;
        }
        
        .wiki-meta {
          color: #666;
          font-size: 0.9rem;
          border-top: 1px solid #eee;
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default WikiPageView;