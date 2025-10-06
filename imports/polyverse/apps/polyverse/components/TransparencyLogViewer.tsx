import { useState, useEffect } from 'react';

interface TransparencyLog {
  id: string;
  event_id: string;
  event_kind: string;
  bundle_id: string;
  decision_type: string;
  decision: any;
  subject_did: string;
  moderator_did: string;
  transparency_record: any;
  created_at: string;
}

interface TransparencyLogResponse {
  logs: TransparencyLog[];
  next_cursor: string | null;
}

const TransparencyLogViewer = () => {
  const [logs, setLogs] = useState<TransparencyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterBundle, setFilterBundle] = useState<string>('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchLogs = async (cursor?: string) => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterBundle) params.append('bundle', filterBundle);
      if (cursor) params.append('cursor', cursor);
      params.append('limit', '50');

      const response = await fetch(`http://localhost:3002/transparency/log?${params}`);
      if (!response.ok) throw new Error('Failed to fetch transparency logs');
      
      const data: TransparencyLogResponse = await response.json();
      
      if (cursor) {
        setLogs(prev => [...prev, ...data.logs]);
      } else {
        setLogs(data.logs);
      }
      setNextCursor(data.next_cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterType, filterBundle]);

  const loadMore = () => {
    if (nextCursor) {
      fetchLogs(nextCursor);
    }
  };

  const formatDecision = (decision: any, decisionType: string) => {
    switch (decisionType) {
      case 'moderation':
        return (
          <div>
            <strong>Decision:</strong> {decision.decision || 'N/A'}<br />
            <strong>Reason:</strong> {decision.reason || 'N/A'}<br />
            <strong>Severity:</strong> {decision.severity || 'N/A'}
          </div>
        );
      case 'confidence_report':
        return (
          <div>
            <strong>Score:</strong> {decision.score || 'N/A'}<br />
            <strong>Lens:</strong> {decision.lens_id || 'N/A'}
          </div>
        );
      case 'playful_signal':
        return (
          <div>
            <strong>Claim:</strong> {decision.claim_id || 'N/A'}<br />
            <strong>Winner:</strong> {decision.winner_side || 'N/A'}<br />
            <strong>Signal:</strong> {decision.signal_strength || 'N/A'}
          </div>
        );
      default:
        return <pre>{JSON.stringify(decision, null, 2)}</pre>;
    }
  };

  const formatTransparencyRecord = (record: any) => {
    if (!record) return 'No transparency record';
    
    return (
      <div className="transparency-details">
        {record.features && (
          <div>
            <strong>Features:</strong>
            <ul>
              {Object.entries(record.features).map(([key, value]) => (
                <li key={key}>
                  {key}: {typeof value === 'number' ? value.toFixed(3) : String(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {record.weights && (
          <div>
            <strong>Weights:</strong>
            <ul>
              {Object.entries(record.weights).map(([key, value]) => (
                <li key={key}>
                  {key}: {typeof value === 'number' ? value.toFixed(3) : String(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {record.constraints && (
          <div>
            <strong>Constraints:</strong>
            <ul>
              {record.constraints.map((constraint: string, index: number) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}
        {record.cap_applied !== undefined && (
          <div>
            <strong>Cap Applied:</strong> {record.cap_applied ? 'Yes' : 'No'}
          </div>
        )}
      </div>
    );
  };

  if (loading && logs.length === 0) return <div>Loading transparency logs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="transparency-log-viewer">
      <div className="filters">
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="moderation">Moderation</option>
          <option value="confidence_report">Confidence Reports</option>
          <option value="playful_signal">Playful Signals</option>
        </select>
        
        <select 
          value={filterBundle} 
          onChange={(e) => setFilterBundle(e.target.value)}
          className="filter-select"
        >
          <option value="">All Bundles</option>
          <option value="baseline_rules">Baseline Rules</option>
          <option value="arena">Arena</option>
          <option value="truth">Truth</option>
        </select>
        
        <button 
          onClick={() => fetchLogs()} 
          className="refresh-button"
        >
          Refresh
        </button>
      </div>

      <div className="logs-list">
        {logs.map((log) => (
          <div key={log.id} className="log-entry">
            <div className="log-header">
              <div className="log-meta">
                <span className="log-type">{log.decision_type}</span>
                <span className="log-bundle">{log.bundle_id}</span>
                <span className="log-time">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              <div className="log-ids">
                <small>Event: {log.event_id}</small>
                <small>Subject: {log.subject_did}</small>
                <small>Moderator: {log.moderator_did}</small>
              </div>
            </div>
            
            <div className="log-content">
              <div className="decision-section">
                <h4>Decision</h4>
                {formatDecision(log.decision, log.decision_type)}
              </div>
              
              <div className="transparency-section">
                <h4>Transparency Record</h4>
                {formatTransparencyRecord(log.transparency_record)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {nextCursor && (
        <div className="load-more">
          <button onClick={loadMore} className="load-more-button">
            Load More
          </button>
        </div>
      )}

      <style jsx>{`
        .transparency-log-viewer {
          max-width: 100%;
          margin: 0 auto;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .refresh-button {
          padding: 0.5rem 1rem;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .refresh-button:hover {
          background: #1565c0;
        }

        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .log-entry {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .log-meta {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .log-type {
          background: #1976d2;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .log-bundle {
          background: #4caf50;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .log-time {
          color: #666;
          font-size: 0.8rem;
        }

        .log-ids {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: right;
        }

        .log-ids small {
          color: #888;
          font-family: monospace;
        }

        .log-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .decision-section,
        .transparency-section {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .decision-section h4,
        .transparency-section h4 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 0.9rem;
        }

        .transparency-details ul {
          margin: 0;
          padding-left: 1rem;
        }

        .transparency-details li {
          margin: 0.25rem 0;
          font-size: 0.8rem;
        }

        .load-more {
          text-align: center;
          margin-top: 2rem;
        }

        .load-more-button {
          padding: 0.75rem 1.5rem;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }

        .load-more-button:hover {
          background: #1565c0;
        }

        @media (max-width: 768px) {
          .filters {
            flex-direction: column;
            align-items: stretch;
          }
          
          .log-header {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .log-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TransparencyLogViewer;