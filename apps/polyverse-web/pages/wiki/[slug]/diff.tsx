import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface WikiRevision {
  id: string;
  page_id: string;
  author_did: string;
  content: string;
  diff: string;
  citations: Array<{url: string; title?: string; quote?: string; accessedAt?: string}>;
  created_at: string;
  author?: {
    did: string;
    name?: string;
  };
}

const WikiDiffPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [revisions, setRevisions] = useState<WikiRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetch(`/api/wiki/${slug}/revisions`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load revisions');
          return res.json();
        })
        .then(data => setRevisions(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Revision History: {slug}</h1>
      
      <div className="revisions">
        {revisions.map((revision, index) => (
          <div key={revision.id} className="revision">
            <h3>Revision {revisions.length - index}</h3>
            <p>
              By {revision.author?.did} on {new Date(revision.created_at).toLocaleString()}
            </p>
            
            {revision.diff && (
              <div className="diff">
                <h4>Changes:</h4>
                <pre>{revision.diff}</pre>
              </div>
            )}
            
            {revision.citations && revision.citations.length > 0 && (
              <div className="citations">
                <h4>Citations:</h4>
                <ul>
                  {revision.citations.map((citation, idx) => (
                    <li key={idx}>
                      <a href={citation.url} target="_blank" rel="noopener noreferrer">
                        {citation.title || citation.url}
                      </a>
                      {citation.quote && <blockquote>{citation.quote}</blockquote>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <hr />
          </div>
        ))}
      </div>

      <style jsx>{`
        .revisions {
          margin: 2rem 0;
        }
        
        .revision {
          margin-bottom: 2rem;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }
        
        .revision h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }
        
        .revision p {
          margin: 0 0 1rem 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .diff {
          margin: 1rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 4px;
        }
        
        .diff h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }
        
        .diff pre {
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .citations {
          margin: 1rem 0;
        }
        
        .citations h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }
        
        .citations ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .citations li {
          margin-bottom: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 4px;
        }
        
        .citations a {
          color: #1976d2;
          text-decoration: none;
        }
        
        .citations a:hover {
          text-decoration: underline;
        }
        
        .citations blockquote {
          margin: 0.5rem 0 0 0;
          padding-left: 1rem;
          border-left: 3px solid #ddd;
          color: #666;
          font-style: italic;
        }
        
        hr {
          border: none;
          border-top: 1px solid #eee;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default WikiDiffPage;