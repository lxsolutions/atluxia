import { useState } from 'react';

interface Citation {
  url: string;
  title: string;
  quote: string;
  accessedAt: string;
  relevance_score: number;
}

interface TruthAgentResponse {
  answer: string;
  citations: Citation[];
  confidence: number;
  dissentingLinks: string[];
  query_suggestions: string[];
}

const AskPage = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<TruthAgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: TruthAgentResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Truth Agent</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          Error: {error}
        </div>
      )}

      {response && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Answer</h2>
            <p className="text-gray-800">{response.answer}</p>
            <div className="mt-2 text-sm text-gray-500">
              Confidence: {(response.confidence * 100).toFixed(1)}%
            </div>
          </div>

          {response.citations.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Citations</h3>
              <div className="space-y-3">
                {response.citations.map((citation, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {citation.title}
                    </a>
                    <p className="text-sm text-gray-600 mt-1">
                      {citation.quote}
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      Relevance: {(citation.relevance_score * 100).toFixed(1)}% • 
                      Accessed: {new Date(citation.accessedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {response.dissentingLinks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Dissenting Views</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {response.dissentingLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {response.query_suggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Suggested Queries</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {response.query_suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!response && !loading && (
        <div className="text-center text-gray-500 py-12">
          <p>Ask a question to get evidence-based answers with citations.</p>
          <p className="text-sm mt-2">The Truth Agent will only provide answers backed by verifiable sources.</p>
        </div>
      )}
    </div>
  );
};

export default AskPage;