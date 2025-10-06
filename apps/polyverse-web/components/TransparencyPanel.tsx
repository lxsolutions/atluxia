import { useState, useEffect } from 'react';

interface TransparencyRecord {
  postId: string;
  bundleId: string;
  features: Record<string, number>;
  score: number;
  explanation: string[];
  signed_at: string;
  sig: string;
}

interface TransparencyPanelProps {
  postId: string;
  bundleId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TransparencyPanel = ({ postId, bundleId, isOpen, onClose }: TransparencyPanelProps) => {
  const [transparencyData, setTransparencyData] = useState<TransparencyRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransparencyData = async () => {
    if (!postId || !bundleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/transparency?postId=${postId}&bundleId=${bundleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transparency data');
      }
      const data = await response.json();
      setTransparencyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchTransparencyData();
    }
  }, [isOpen, postId, bundleId]);

  if (!isOpen) return null;

  return (
    <div className="transparency-panel-overlay" onClick={onClose}>
      <div className="transparency-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Why this post?</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="panel-content">
          {loading && <p>Loading transparency data...</p>}
          
          {error && (
            <div className="error">
              <p>Error: {error}</p>
            </div>
          )}
          
          {transparencyData && (
            <div className="transparency-data">
              <div className="score-section">
                <h4>Score: {transparencyData.score.toFixed(2)}</h4>
                <p><strong>Algorithm:</strong> {transparencyData.bundleId}</p>
              </div>
              
              <div className="features-section">
                <h4>Features:</h4>
                <ul>
                  {Object.entries(transparencyData.features).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {typeof value === 'number' ? value.toFixed(3) : value}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="explanation-section">
                <h4>Explanation:</h4>
                <ul>
                  {transparencyData.explanation.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="signature-section">
                <p><small>Signed at: {new Date(transparencyData.signed_at).toLocaleString()}</small></p>
              </div>
            </div>
          )}
          
          {!loading && !error && !transparencyData && (
            <p>No transparency data available for this post.</p>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .transparency-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .transparency-panel {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }
        
        .panel-header h3 {
          margin: 0;
          color: #333;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-button:hover {
          color: #000;
          background: #f5f5f5;
          border-radius: 50%;
        }
        
        .panel-content {
          line-height: 1.5;
        }
        
        .error {
          color: #d32f2f;
          background: #ffebee;
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ffcdd2;
        }
        
        .score-section {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .score-section h4 {
          margin: 0 0 0.5rem 0;
          color: #1976d2;
        }
        
        .features-section,
        .explanation-section {
          margin-bottom: 1rem;
        }
        
        .features-section h4,
        .explanation-section h4 {
          margin: 0 0 0.5rem 0;
          color: #555;
        }
        
        .features-section ul,
        .explanation-section ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        
        .features-section li,
        .explanation-section li {
          margin-bottom: 0.25rem;
        }
        
        .signature-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default TransparencyPanel;